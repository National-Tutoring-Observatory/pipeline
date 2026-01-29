import has from "lodash/has";
import map from "lodash/map";
import throttle from "lodash/throttle";
import { useEffect, useState } from "react";
import {
  redirect,
  useFetcher,
  useLoaderData,
  useNavigate,
  useRevalidator,
  useSubmit,
} from "react-router";
import { toast } from "sonner";
import useHandleSockets from "~/modules/app/hooks/useHandleSockets";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import { CollectionService } from "~/modules/collections/collection";
import addDialog from "~/modules/dialogs/addDialog";
import { ProjectService } from "~/modules/projects/project";
import exportRun from "~/modules/runs/helpers/exportRun";
import { RunService } from "~/modules/runs/run";
import type { Run } from "~/modules/runs/runs.types";
import EditRunDialog from "../components/editRunDialog";
import ProjectRun from "../components/projectRun";
import startRun from "../services/startRun.server";
import type { Route } from "./+types/projectRun.route";

interface PromptInfo {
  name: string;
  version: number;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, "team");
  const project = await ProjectService.findOne({
    _id: params.projectId,
    team: { $in: teamIds },
  });
  if (!project) {
    return redirect("/");
  }
  const run = await RunService.findOne({
    _id: params.runId,
    project: params.projectId,
  });
  if (!run) {
    return redirect("/");
  }

  const promptInfo: PromptInfo = {
    name: run.snapshot.prompt.name,
    version: run.snapshot.prompt.version,
  };

  const url = new URL(request.url);
  const collectionId = url.searchParams.get("collectionId");
  const collection = collectionId
    ? await CollectionService.findById(collectionId)
    : null;

  const intent = url.searchParams.get("intent");
  if (intent === "GET_ALL_COLLECTIONS") {
    const runCollections = await CollectionService.paginate({
      match: { runs: params.runId },
      page: 1,
      pageSize: 100,
    });
    return { collections: runCollections.data };
  }

  const runCollections = await CollectionService.paginate({
    match: { runs: params.runId },
    page: 1,
    pageSize: 4,
  });

  return {
    project,
    run,
    promptInfo,
    collection,
    runCollections: runCollections.data,
    runCollectionsCount: runCollections.count,
  };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const { intent, entityId, payload = {} } = await request.json();

  const { annotationType, prompt, promptVersion, model, sessions, exportType } =
    payload;

  switch (intent) {
    case "START_RUN": {
      const { runId, projectId } = params;

      const run = await startRun({
        runId,
        projectId,
        sessions,
        annotationType,
        prompt,
        promptVersion,
        modelCode: model,
      });

      if (!run) throw new Error("Run not created");
      await RunService.createAnnotations(run);

      return {};
    }
    case "RE_RUN": {
      const run = await RunService.findById(params.runId);
      if (!run) throw new Error("Run not found");
      await RunService.createAnnotations(run);

      return {};
    }
    case "EXPORT_RUN": {
      exportRun({ runId: params.runId, exportType });
      return {};
    }
    default:
      return {};
  }
}

const debounceRevalidate = throttle((revalidate) => {
  revalidate();
}, 2000);

export default function ProjectRunRoute() {
  const {
    project,
    run,
    promptInfo,
    collection,
    runCollections,
    runCollectionsCount,
  } = useLoaderData();
  const [runSessionsProgress, setRunSessionsProgress] = useState(0);
  const [runSessionsStep, setRunSessionsStep] = useState("");
  const submit = useSubmit();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { revalidate, state } = useRevalidator();

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      toast.success("Updated run");
    }
  }, [fetcher.state, fetcher.data]);

  const onExportRunButtonClicked = ({ exportType }: { exportType: string }) => {
    submit(
      JSON.stringify({
        intent: "EXPORT_RUN",
        payload: {
          exportType,
        },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  const onReRunClicked = () => {
    submit(
      JSON.stringify({
        intent: "RE_RUN",
        payload: {},
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  const onEditRunButtonClicked = (run: Run) => {
    addDialog(
      <EditRunDialog
        run={run}
        onEditRunClicked={(r: Run) => {
          fetcher.submit(
            JSON.stringify({
              intent: "UPDATE_RUN",
              entityId: r._id,
              payload: { name: r.name },
            }),
            {
              method: "PUT",
              encType: "application/json",
              action: `/projects/${project._id}?index`,
            },
          );
        }}
      />,
    );
  };

  const onCreateCollectionButtonClicked = (run: Run) => {
    navigate(`/projects/${project._id}/create-collection?fromRun=${run._id}`);
  };

  useHandleSockets({
    event: "ANNOTATE_RUN",
    matches: [
      {
        runId: run._id,
        task: "ANNOTATE_RUN:START",
        status: "FINISHED",
      },
      {
        runId: run._id,
        task: "ANNOTATE_RUN:PROCESS",
        status: "STARTED",
      },
      {
        runId: run._id,
        task: "ANNOTATE_RUN:PROCESS",
        status: "FINISHED",
      },
      {
        runId: run._id,
        task: "ANNOTATE_RUN:FINISH",
        status: "FINISHED",
      },
    ],
    callback: (payload) => {
      if (has(payload, "progress")) {
        setRunSessionsProgress(payload.progress);
      }
      if (has(payload, "step")) {
        setRunSessionsStep(payload.step);
      }
      debounceRevalidate(revalidate);
    },
  });

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.runId === run._id) {
        switch (data.event) {
          case "ANNOTATE_RUN_SESSION":
            setRunSessionsProgress(data.progress);
            if (data.step) {
              setRunSessionsStep(data.step);
            }
            debounceRevalidate(revalidate);
            break;
          case "EXPORT_RUN":
            debounceRevalidate(revalidate);
            // If the export finished, trigger download automatically.
            if (data.status === "DONE") {
              const url = data.url;
              const a = document.createElement("a");
              a.href = url;
              a.target = "_blank";
              a.rel = "noopener";
              // Append to body before clicking to ensure Safari compatibility
              document.body.appendChild(a);
              a.click();
              // Remove after click
              document.body.removeChild(a);
            }
            break;
        }
      }
    };
    return () => {
      eventSource.close();
    };
  }, []);

  const parentBreadcrumbs = collection
    ? [
        { text: "Collections", link: `/projects/${project._id}/collections` },
        {
          text: collection.name,
          link: `/projects/${project._id}/collections/${collection._id}`,
        },
      ]
    : [{ text: "Runs", link: `/projects/${project._id}` }];

  const breadcrumbs = [
    { text: "Projects", link: `/` },
    { text: project.name, link: `/projects/${project._id}` },
    ...parentBreadcrumbs,
    { text: run.name },
  ];

  return (
    <ProjectRun
      run={run}
      promptInfo={promptInfo}
      collections={runCollections || []}
      collectionsCount={runCollectionsCount || 0}
      runSessionsProgress={runSessionsProgress}
      runSessionsStep={runSessionsStep}
      breadcrumbs={breadcrumbs}
      onExportRunButtonClicked={onExportRunButtonClicked}
      onReRunClicked={onReRunClicked}
      onEditRunButtonClicked={onEditRunButtonClicked}
      onCreateCollectionButtonClicked={onCreateCollectionButtonClicked}
    />
  );
}
