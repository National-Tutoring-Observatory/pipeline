import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import { useEffect } from "react";
import {
  data,
  redirect,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "react-router";
import { toast } from "sonner";
import aiGatewayConfig from "~/config/ai_gateway.json";
import trackServerEvent from "~/modules/analytics/helpers/trackServerEvent.server";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { PromptService } from "~/modules/prompts/prompt";
import { getRunModelCode } from "~/modules/runs/helpers/runModel";
import { RunService } from "~/modules/runs/run";
import type { RunAnnotationType } from "~/modules/runs/runs.types";
import RunSetCreatorContainer from "~/modules/runSets/containers/runSetCreator.container";
import { RunSetService } from "~/modules/runSets/runSet";
import type {
  PrefillData,
  PromptReference,
} from "~/modules/runSets/runSets.types";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/runSetCreate.route";

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

  // Check for fromRun or fromRunSet query parameter
  const url = new URL(request.url);
  const fromRunId = url.searchParams.get("fromRun");
  const fromRunSetId = url.searchParams.get("fromRunSet");

  let prefillData: PrefillData | null = null;

  if (fromRunId) {
    try {
      const run = await RunService.findOne({
        _id: fromRunId,
        project: params.projectId,
      });

      // Validate run exists and belongs to this project
      if (run) {
        // Extract session IDs
        const sessionIds = run.sessions.map((s) => s.sessionId);

        // Fetch prompt details for display
        const prompt = await PromptService.findById(run.prompt as string);

        const modelCode = getRunModelCode(run);
        prefillData = {
          sourceRunId: run._id,
          sourceRunName: run.name,
          annotationType: run.annotationType,
          selectedPrompts: [
            {
              promptId: run.prompt as string,
              promptName: prompt?.name || "",
              version: run.promptVersion ?? 0,
            },
          ],
          selectedModels: modelCode ? [modelCode] : [],
          selectedSessions: sessionIds,
        };
      }
    } catch (error) {
      // If there's an error fetching run data, just continue with empty form
      console.error("Error fetching run for prefill:", error);
    }
  } else if (fromRunSetId) {
    try {
      const runSet = await RunSetService.findById(fromRunSetId);

      if (runSet && runSet.project === params.projectId) {
        const validationErrors: string[] = [];

        // Fetch all runs in the runSet
        const runs = runSet.runs?.length
          ? await RunService.find({ match: { _id: { $in: runSet.runs } } })
          : [];

        if (runs.length === 0) {
          validationErrors.push("Source runSet has no runs to use as template");
        }

        // Get annotation type from first run (all runs should have same type)
        const annotationType = runs[0]?.annotationType || "PER_UTTERANCE";

        // Collect unique prompts and models from all runs
        const promptMap = new Map<
          string,
          { promptId: string; version: number }
        >();
        const modelSet = new Set<string>();

        for (const run of runs) {
          const key = `${run.prompt}-${run.promptVersion}`;
          if (!promptMap.has(key)) {
            promptMap.set(key, {
              promptId: run.prompt as string,
              version: run.promptVersion ?? 0,
            });
          }
          const modelCode = getRunModelCode(run);
          if (modelCode) {
            modelSet.add(modelCode);
          }
        }

        // Fetch all prompts in a single query
        const promptIds = Array.from(promptMap.values()).map((p) => p.promptId);
        const prompts = await PromptService.find({
          match: { _id: { $in: promptIds } },
        });
        const promptsById = new Map(prompts.map((p) => [p._id, p]));

        // Validate prompts still exist and build selected prompts
        const selectedPrompts: PromptReference[] = [];
        for (const [, promptRef] of promptMap) {
          const prompt = promptsById.get(promptRef.promptId);
          if (prompt) {
            selectedPrompts.push({
              promptId: promptRef.promptId,
              promptName: prompt.name,
              version: promptRef.version,
            });
          } else {
            validationErrors.push(
              `Prompt "${promptRef.promptId}" no longer exists`,
            );
          }
        }

        // Validate models exist in config
        const availableModelCodes = new Set(
          aiGatewayConfig.providers.flatMap((p) => p.models.map((m) => m.code)),
        );
        const selectedModels: string[] = [];
        for (const modelCode of modelSet) {
          if (availableModelCodes.has(modelCode)) {
            selectedModels.push(modelCode);
          } else {
            validationErrors.push(
              `Model "${modelCode}" is no longer available`,
            );
          }
        }

        prefillData = {
          sourceRunSetId: runSet._id,
          sourceRunSetName: runSet.name,
          annotationType,
          selectedPrompts,
          selectedModels,
          selectedSessions: runSet.sessions || [],
          validationErrors:
            validationErrors.length > 0 ? validationErrors : undefined,
        };
      }
    } catch (error) {
      console.error("Error fetching runSet for prefill:", error);
    }
  }

  const avgSecondsPerSession = await RunService.getAverageSecondsPerSession(
    params.projectId,
  );

  return { project, prefillData, avgSecondsPerSession };
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

  const { name, annotationType, definitions, sessions } = payload;

  switch (intent) {
    case "CREATE_RUN_SET": {
      const errors: Record<string, string> = {};

      if (typeof name !== "string" || name.trim().length < 1) {
        errors.name = "Run set name is required";
      }

      if (!["PER_UTTERANCE", "PER_SESSION"].includes(annotationType)) {
        errors.annotationType = "Invalid annotation type";
      }

      if (!Array.isArray(definitions) || definitions.length === 0) {
        errors.definitions = "At least one run is required";
      }

      if (!Array.isArray(sessions) || sessions.length === 0) {
        errors.sessions = "At least one session is required";
      }

      if (Object.keys(errors).length > 0) {
        return data({ errors }, { status: 400 });
      }

      const result = await RunSetService.createWithRuns({
        project: params.projectId,
        name,
        sessions,
        definitions,
        annotationType: annotationType as RunAnnotationType,
        shouldRunVerification: !!payload.shouldRunVerification,
      });

      await trackServerEvent({ name: "run_set_created", userId: user._id });
      await trackServerEvent({ name: "run_created", userId: user._id });

      return {
        intent: "CREATE_RUN_SET",
        data: {
          runSetId: result.runSet._id,
          projectId: params.projectId,
          errors: result.errors,
        },
      };
    }

    default: {
      return data({ errors: { intent: "Invalid intent" } }, { status: 400 });
    }
  }
}

export default function RunSetCreateRoute() {
  const { project, prefillData, avgSecondsPerSession } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const breadcrumbs = [
    { text: "Projects", link: "/" },
    { text: project.name, link: `/projects/${project._id}` },
    { text: "Run Sets", link: `/projects/${project._id}/run-sets` },
    { text: "Create Run Set" },
  ];

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (fetcher.data?.intent !== "CREATE_RUN_SET") return;

    const runSetId = fetcher.data.data?.runSetId;
    if (runSetId) {
      const runErrors = fetcher.data?.data?.errors;
      if (runErrors && runErrors.length > 0) {
        toast.warning(
          `RunSet created, but ${runErrors.length} run(s) failed to start`,
        );
      } else {
        toast.success("RunSet created successfully");
      }
      navigate(`/projects/${project._id}/run-sets/${runSetId}`);
    }
  }, [fetcher.state, fetcher.data, navigate, project._id]);

  const handleSubmit = (requestBody: string) => {
    fetcher.submit(requestBody, {
      method: "POST",
      encType: "application/json",
    });
  };

  return (
    <div>
      <div className="px-8 pt-8">
        <PageHeader>
          <PageHeaderLeft>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          </PageHeaderLeft>
        </PageHeader>
        <div className="mb-8">
          <p className="text-muted-foreground">
            Set up a new runSet with your preferred annotation settings
          </p>
        </div>
      </div>

      <RunSetCreatorContainer
        prefillData={prefillData}
        avgSecondsPerSession={avgSecondsPerSession}
        onSubmit={handleSubmit}
        isLoading={fetcher.state !== "idle"}
        errors={(fetcher.data as any)?.errors || {}}
      />
    </div>
  );
}
