import throttle from "lodash/throttle";
import {
  data,
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
  useRevalidator,
  useSubmit,
} from "react-router";
import type { Breadcrumb } from "~/modules/app/app.types";
import useHandleSockets from "~/modules/app/hooks/useHandleSockets";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import RunSetDetail from "~/modules/runSets/components/runSetDetail";
import exportRunSet from "~/modules/runSets/helpers/exportRunSet";
import requireRunSetsFeature from "~/modules/runSets/helpers/requireRunSetsFeature";
import { useRunSetActions } from "~/modules/runSets/hooks/useRunSetActions";
import { RunSetService } from "~/modules/runSets/runSet";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/runSetDetail.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const project = await ProjectService.findById(params.projectId);
  if (!project) {
    return redirect("/");
  }

  if (!ProjectAuthorization.canView(user, project)) {
    return redirect("/");
  }

  await requireRunSetsFeature(request, params);

  const runSet = await RunSetService.findById(params.runSetId);
  if (!runSet) {
    return redirect(`/projects/${params.projectId}/run-sets`);
  }

  const runIds = runSet.runs ?? [];
  const totalRuns = runIds.length;
  let runsProgress = { total: totalRuns, completed: 0, running: 0 };

  if (totalRuns > 0) {
    const [completed, running] = await Promise.all([
      RunService.count({ _id: { $in: runIds }, isComplete: true }),
      RunService.count({ _id: { $in: runIds }, isRunning: true }),
    ]);
    runsProgress = { total: totalRuns, completed, running };
  }

  return {
    runSet,
    project,
    runsProgress,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const project = await ProjectService.findById(params.projectId);
  if (!project) {
    return data({ errors: { project: "Project not found" } }, { status: 404 });
  }

  if (!ProjectAuthorization.Runs.canManage(user, project)) {
    return data({ errors: { project: "Access denied" } }, { status: 403 });
  }

  const { intent, payload = {} } = await request.json();

  switch (intent) {
    case "EXPORT_RUN_SET": {
      const { exportType } = payload;
      await exportRunSet({ runSetId: params.runSetId, exportType });
      return {};
    }
    default: {
      return data({ errors: { intent: "Invalid intent" } }, { status: 400 });
    }
  }
}

const debounceRevalidate = throttle((revalidate) => {
  revalidate();
}, 500);

export default function RunSetDetailRoute() {
  const { runSet, project, runsProgress } = useLoaderData<typeof loader>();
  const runIds = runSet.runs ?? [];
  const submit = useSubmit();
  const navigate = useNavigate();
  const location = useLocation();
  const { revalidate } = useRevalidator();

  const parts = location.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  const activeView = last === "evaluations" ? "evaluations" : "overview";

  const onActiveViewChange = (value: string) => {
    const basePath = `/projects/${project._id}/run-sets/${runSet._id}`;
    if (value === "overview") {
      navigate(basePath);
    } else {
      navigate(`${basePath}/${value}`);
    }
  };

  const {
    openEditRunSetDialog,
    openDeleteRunSetDialog,
    openDuplicateRunSetDialog,
  } = useRunSetActions({
    projectId: project._id,
    onDeleteSuccess: () => {
      navigate(`/projects/${project._id}/run-sets`);
    },
  });

  const onExportRunSetButtonClicked = ({
    exportType,
  }: {
    exportType: string;
  }) => {
    submit(
      JSON.stringify({
        intent: "EXPORT_RUN_SET",
        payload: {
          exportType,
        },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  useHandleSockets({
    event: "ANNOTATE_RUN",
    matches: runIds.map((runId) => ({
      runId,
      task: "ANNOTATE_RUN:FINISH",
      status: "FINISHED",
    })),
    callback: () => {
      debounceRevalidate(revalidate);
    },
  });

  useHandleSockets({
    event: "EXPORT_RUN_SET",
    matches: [
      {
        runSetId: runSet._id,
        task: "EXPORT_RUN_SET:START",
        status: "FINISHED",
      },
      {
        runSetId: runSet._id,
        task: "EXPORT_RUN_SET:FINISH",
        status: "FINISHED",
      },
    ],
    callback: () => {
      debounceRevalidate(revalidate);
    },
  });

  const breadcrumbs = [
    { text: "Projects", link: "/" },
    { text: project.name, link: `/projects/${project._id}` },
    { text: "Run Sets", link: `/projects/${project._id}/run-sets` },
  ] as Breadcrumb[];

  if (activeView === "evaluations") {
    breadcrumbs.push(
      {
        text: runSet.name,
        link: `/projects/${project._id}/run-sets/${runSet._id}`,
      },
      {
        text: "Evaluations",
      },
    );
  } else {
    breadcrumbs.push({ text: runSet.name });
  }

  return (
    <RunSetDetail
      runSet={runSet}
      project={project}
      breadcrumbs={breadcrumbs}
      runsProgress={runsProgress}
      onExportRunSetButtonClicked={onExportRunSetButtonClicked}
      onAddRunsClicked={() =>
        navigate(`/projects/${project._id}/run-sets/${runSet._id}/add-runs`)
      }
      onMergeClicked={() =>
        navigate(`/projects/${project._id}/run-sets/${runSet._id}/merge`)
      }
      onDuplicateClicked={() => openDuplicateRunSetDialog(runSet)}
      onEditClicked={() => openEditRunSetDialog(runSet)}
      onDeleteClicked={() => openDeleteRunSetDialog(runSet)}
      activeView={activeView}
      onActiveViewChange={onActiveViewChange}
    />
  );
}
