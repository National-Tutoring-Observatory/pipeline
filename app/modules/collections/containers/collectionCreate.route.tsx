import { data, redirect } from 'react-router';
import { useLoaderData } from 'react-router';
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { CollectionService } from '~/modules/collections/collection';
import { ProjectService } from '~/modules/projects/project';
import type { User } from '~/modules/users/users.types';
import type { RunAnnotationType } from '~/modules/runs/runs.types';
import ProjectAuthorization from '~/modules/projects/authorization';
import type { Route } from './+types/collectionCreate.route';
import CollectionCreatorFormContainer from './collectionCreatorForm.container';

interface PromptReference {
  promptId: string;
  promptName?: string;
  version: number;
}

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

  return { project };
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
  const { project } = useLoaderData<typeof loader>();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Collection</h1>
        <p className="text-muted-foreground">Set up a new collection with your preferred annotation settings</p>
      </div>

      <CollectionCreatorFormContainer projectId={project._id} />
    </div>
  );
}
