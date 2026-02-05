import map from "lodash/map";
import { useEffect } from "react";
import { redirect, useFetcher, useLoaderData, useNavigate } from "react-router";
import { toast } from "sonner";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import type { CreateRun as CreateRunPayload } from "~/modules/runs/runs.types";
import { validateRunResources } from "~/modules/runs/services/validateRunResources.server";
import CreateRunComponent from "../components/createRun";
import type { Route } from "./+types/createRun.route";

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

  const url = new URL(request.url);
  const duplicateFrom = url.searchParams.get("duplicateFrom");

  let initialRun = null;
  let duplicateWarnings: string[] = [];

  if (duplicateFrom) {
    initialRun = await RunService.findById(duplicateFrom);
    if (initialRun) {
      duplicateWarnings = await validateRunResources(initialRun);
    }
  }

  return { project, initialRun, duplicateWarnings };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const { intent, payload = {} } = await request.json();

  const { name, annotationType, prompt, promptVersion, model, sessions } =
    payload;

  switch (intent) {
    case "CREATE_AND_START_RUN": {
      if (typeof name !== "string") {
        throw new Error("Run name is required and must be a string.");
      }
      if (!["PER_UTTERANCE", "PER_SESSION"].includes(annotationType)) {
        throw new Error("Invalid annotation type.");
      }

      const run = await RunService.create({
        project: params.projectId,
        name,
        sessions,
        annotationType,
        prompt,
        promptVersion: Number(promptVersion),
        modelCode: model,
      });

      await RunService.start(run);

      return {
        intent: "CREATE_AND_START_RUN",
        data: run,
      };
    }
    default: {
      return {};
    }
  }
}

export default function ProjectCreateRunRoute() {
  const { project, initialRun, duplicateWarnings } = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const isSubmitting =
    fetcher.state !== "idle" || fetcher.data?.intent === "CREATE_AND_START_RUN";

  const onStartRunClicked = ({
    name,
    selectedAnnotationType,
    selectedPrompt,
    selectedPromptVersion,
    selectedModel,
    selectedSessions,
  }: CreateRunPayload) => {
    fetcher.submit(
      JSON.stringify({
        intent: "CREATE_AND_START_RUN",
        payload: {
          name,
          annotationType: selectedAnnotationType,
          prompt: selectedPrompt,
          promptVersion: Number(selectedPromptVersion),
          model: selectedModel,
          sessions: selectedSessions,
        },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (!fetcher.data || !("intent" in fetcher.data)) return;
    if (fetcher.data.intent === "CREATE_AND_START_RUN") {
      toast.success("Run created and started");
      navigate(
        `/projects/${fetcher.data.data.project}/runs/${fetcher.data.data._id}`,
      );
    }
  }, [fetcher.state, fetcher.data, navigate]);

  const breadcrumbs = [
    { text: "Projects", link: `/` },
    { text: project!.name, link: `/projects/${project!._id}` },
    { text: "Create run" },
  ];

  return (
    <CreateRunComponent
      breadcrumbs={breadcrumbs}
      onStartRunClicked={onStartRunClicked}
      isSubmitting={isSubmitting}
      initialRun={initialRun}
      duplicateWarnings={duplicateWarnings}
    />
  );
}
