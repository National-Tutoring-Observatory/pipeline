import { useEffect, useState } from 'react';
import { data, redirect } from 'react-router';
import { useLoaderData, useFetcher, useNavigate } from 'react-router';
import { toast } from 'sonner';
import updateBreadcrumb from '~/modules/app/updateBreadcrumb';
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { CollectionService } from '~/modules/collections/collection';
import type { PrefillData, PromptReference } from '~/modules/collections/collections.types';
import { ProjectService } from '~/modules/projects/project';
import { RunService } from '~/modules/runs/run';
import { PromptService } from '~/modules/prompts/prompt';
import type { User } from '~/modules/users/users.types';
import type { RunAnnotationType } from '~/modules/runs/runs.types';
import ProjectAuthorization from '~/modules/projects/authorization';
import type { Route } from './+types/collectionCreate.route';
import CollectionCreatorForm from '../components/collectionCreatorForm';

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

  // Check for fromRun query parameter
  const url = new URL(request.url);
  const fromRunId = url.searchParams.get('fromRun');

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

      const result = await CollectionService.createWithRuns(
        {
          project: params.projectId,
          name,
          sessions,
          runs: [],
          hasSetup: false
        },
        prompts,
        models,
        annotationType as RunAnnotationType
      );

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
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const [name, setName] = useState(prefillData ? `Collection from ${prefillData.sourceRunName}` : '');
  const [annotationType, setAnnotationType] = useState(prefillData?.annotationType || 'PER_UTTERANCE');
  const [selectedPrompts, setSelectedPrompts] = useState<PromptReference[]>(prefillData?.selectedPrompts || []);
  const [selectedModels, setSelectedModels] = useState<string[]>(prefillData?.selectedModels || []);
  const [selectedSessions, setSelectedSessions] = useState<string[]>(prefillData?.selectedSessions || []);

  useEffect(() => {
    if (!fetcher.data || fetcher.state !== 'idle') return;

    if ('intent' in fetcher.data && fetcher.data.intent === 'CREATE_COLLECTION' && 'data' in fetcher.data) {
      const errors = fetcher.data.data.errors || [];
      const collectionId = fetcher.data.data.collectionId;

      if (errors.length === 0 && collectionId) {
        toast.success('Collection created successfully');
        navigate(`/projects/${project._id}/collections/${collectionId}`);
      } else if (errors.length > 0) {
        toast.error('Failed to create some runs in the collection');
      }
    }
  }, [fetcher.data, fetcher.state, navigate, project._id]);

  useEffect(() => {
    updateBreadcrumb([
      { text: 'Projects', link: '/' },
      { text: project.name, link: `/projects/${project._id}` },
      { text: 'Collections', link: `/projects/${project._id}/collections` },
      { text: 'Create Collection' }
    ]);
  }, [project._id, project.name]);

  const handleCreateCollection = () => {
    fetcher.submit(
      JSON.stringify({
        intent: 'CREATE_COLLECTION',
        payload: {
          name,
          annotationType,
          prompts: selectedPrompts,
          models: selectedModels,
          sessions: selectedSessions
        }
      }),
      { method: 'POST', encType: 'application/json' }
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Collection</h1>
        <p className="text-muted-foreground">Set up a new collection with your preferred annotation settings</p>
      </div>

      <CollectionCreatorForm
        name={name}
        annotationType={annotationType}
        selectedPrompts={selectedPrompts}
        selectedModels={selectedModels}
        selectedSessions={selectedSessions}
        onNameChanged={setName}
        onAnnotationTypeChanged={setAnnotationType}
        onPromptsChanged={setSelectedPrompts}
        onModelsChanged={setSelectedModels}
        onSessionsChanged={setSelectedSessions}
        onCreateClicked={handleCreateCollection}
        isLoading={fetcher.state !== 'idle'}
        errors={(fetcher.data as any)?.errors || {}}
        prefillData={prefillData}
      />
    </div>
  );
}
