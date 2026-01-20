import { useEffect } from 'react';
import { data, redirect } from 'react-router';
import { useLoaderData } from 'react-router';
import aiGatewayConfig from '~/config/ai_gateway.json';
import updateBreadcrumb from '~/modules/app/updateBreadcrumb';
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { CollectionService } from '~/modules/collections/collection';
import type { PrefillData, PromptReference } from '~/modules/collections/collections.types';
import requireCollectionsFeature from '~/modules/collections/helpers/requireCollectionsFeature';
import { ProjectService } from '~/modules/projects/project';
import { RunService } from '~/modules/runs/run';
import { PromptService } from '~/modules/prompts/prompt';
import type { User } from '~/modules/users/users.types';
import type { RunAnnotationType } from '~/modules/runs/runs.types';
import ProjectAuthorization from '~/modules/projects/authorization';
import type { Route } from './+types/collectionCreate.route';
import CollectionCreatorFormContainer from './collectionCreatorForm.container';

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const project = await ProjectService.findById(params.projectId);
  if (!project) {
    return redirect('/');
  }

  if (!ProjectAuthorization.canView(user, project)) {
    return redirect('/');
  }

  await requireCollectionsFeature(request, params);

  // Check for fromRun or fromCollection query parameter
  const url = new URL(request.url);
  const fromRunId = url.searchParams.get('fromRun');
  const fromCollectionId = url.searchParams.get('fromCollection');

  let prefillData: PrefillData | null = null;

  if (fromRunId) {
    try {
      const run = await RunService.findOne({ _id: fromRunId, project: params.projectId });

      // Validate run exists and belongs to this project
      if (run) {
        // Extract session IDs
        const sessionIds = run.sessions.map(s => s.sessionId);

        // Fetch prompt details for display
        const prompt = await PromptService.findById(run.prompt as string);

        prefillData = {
          sourceRunId: run._id,
          sourceRunName: run.name,
          annotationType: run.annotationType,
          selectedPrompts: [{
            promptId: run.prompt as string,
            promptName: prompt?.name || '',
            version: run.promptVersion
          }],
          selectedModels: [run.model],
          selectedSessions: sessionIds
        };
      }
    } catch (error) {
      // If there's an error fetching run data, just continue with empty form
      console.error('Error fetching run for prefill:', error);
    }
  } else if (fromCollectionId) {
    try {
      const collection = await CollectionService.findById(fromCollectionId);

      if (collection && collection.project === params.projectId) {
        const validationErrors: string[] = [];

        // Fetch all runs in the collection
        const runs = collection.runs?.length
          ? await RunService.find({ match: { _id: { $in: collection.runs } } })
          : [];

        if (runs.length === 0) {
          validationErrors.push('Source collection has no runs to use as template');
        }

        // Get annotation type from first run (all runs should have same type)
        const annotationType = runs[0]?.annotationType || 'PER_UTTERANCE';

        // Collect unique prompts and models from all runs
        const promptMap = new Map<string, { promptId: string; version: number }>();
        const modelSet = new Set<string>();

        for (const run of runs) {
          const key = `${run.prompt}-${run.promptVersion}`;
          if (!promptMap.has(key)) {
            promptMap.set(key, {
              promptId: run.prompt as string,
              version: run.promptVersion
            });
          }
          modelSet.add(run.model);
        }

        // Fetch all prompts in a single query
        const promptIds = Array.from(promptMap.values()).map(p => p.promptId);
        const prompts = await PromptService.find({ match: { _id: { $in: promptIds } } });
        const promptsById = new Map(prompts.map(p => [p._id, p]));

        // Validate prompts still exist and build selected prompts
        const selectedPrompts: PromptReference[] = [];
        for (const [, promptRef] of promptMap) {
          const prompt = promptsById.get(promptRef.promptId);
          if (prompt) {
            selectedPrompts.push({
              promptId: promptRef.promptId,
              promptName: prompt.name,
              version: promptRef.version
            });
          } else {
            validationErrors.push(`Prompt "${promptRef.promptId}" no longer exists`);
          }
        }

        // Validate models exist in config
        const availableModelCodes = new Set(
          aiGatewayConfig.providers.flatMap(p => p.models.map(m => m.code))
        );
        const selectedModels: string[] = [];
        for (const modelCode of modelSet) {
          if (availableModelCodes.has(modelCode)) {
            selectedModels.push(modelCode);
          } else {
            validationErrors.push(`Model "${modelCode}" is no longer available`);
          }
        }

        prefillData = {
          sourceCollectionId: collection._id,
          sourceCollectionName: collection.name,
          annotationType,
          selectedPrompts,
          selectedModels,
          selectedSessions: collection.sessions || [],
          validationErrors: validationErrors.length > 0 ? validationErrors : undefined
        };
      }
    } catch (error) {
      console.error('Error fetching collection for prefill:', error);
    }
  }

  return { project, prefillData };
}

export async function action({
  request,
  params,
  context
}: Route.ActionArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const project = await ProjectService.findById(params.projectId);
  if (!project) {
    return data({ errors: { project: 'Project not found' } }, { status: 404 });
  }

  if (!ProjectAuthorization.Runs.canManage(user, project)) {
    return data({ errors: { project: 'Access denied' } }, { status: 403 });
  }

  const { intent, payload = {} } = await request.json();

  const {
    name,
    annotationType,
    prompts,
    models,
    sessions
  } = payload;

  switch (intent) {
    case 'CREATE_COLLECTION': {
      const errors: Record<string, string> = {};

      if (typeof name !== 'string' || name.trim().length < 1) {
        errors.name = 'Collection name is required';
      }

      if (!['PER_UTTERANCE', 'PER_SESSION'].includes(annotationType)) {
        errors.annotationType = 'Invalid annotation type';
      }

      if (!Array.isArray(prompts) || prompts.length === 0) {
        errors.prompts = 'At least one prompt is required';
      }

      if (!Array.isArray(models) || models.length === 0) {
        errors.models = 'At least one model is required';
      }

      if (!Array.isArray(sessions) || sessions.length === 0) {
        errors.sessions = 'At least one session is required';
      }

      if (Object.keys(errors).length > 0) {
        return data({ errors }, { status: 400 });
      }

      const result = await CollectionService.createWithRuns({
        project: params.projectId,
        name,
        sessions,
        prompts,
        models,
        annotationType: annotationType as RunAnnotationType
      });

      return {
        intent: 'CREATE_COLLECTION',
        data: {
          collectionId: result.collection._id,
          projectId: params.projectId,
          errors: result.errors
        }
      };
    }

    default: {
      return data({ errors: { intent: 'Invalid intent' } }, { status: 400 });
    }
  }
}

export default function CollectionCreateRoute() {
  const { project, prefillData } = useLoaderData<typeof loader>();

  useEffect(() => {
    updateBreadcrumb([
      { text: 'Projects', link: '/' },
      { text: project.name, link: `/projects/${project._id}` },
      { text: 'Collections', link: `/projects/${project._id}/collections` },
      { text: 'Create Collection' }
    ]);
  }, [project._id, project.name]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Collection</h1>
        <p className="text-muted-foreground">Set up a new collection with your preferred annotation settings</p>
      </div>

      <CollectionCreatorFormContainer projectId={project._id} prefillData={prefillData} />
    </div>
  );
}
