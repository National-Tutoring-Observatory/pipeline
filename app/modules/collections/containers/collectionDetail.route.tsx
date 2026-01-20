import { useEffect } from 'react';
import { data, redirect, useLoaderData, useNavigate, useRevalidator, useSubmit } from 'react-router';
import find from 'lodash/find';
import { Button } from '@/components/ui/button';
import { Collection } from '@/components/ui/collection';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, GitMerge, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import throttle from 'lodash/throttle';
import updateBreadcrumb from '~/modules/app/updateBreadcrumb';
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import useHandleSockets from '~/modules/app/hooks/useHandleSockets';
import addDialog from '~/modules/dialogs/addDialog';
import { CollectionService } from '~/modules/collections/collection';
import CollectionDownloads from '~/modules/collections/components/collectionDownloads';
import exportCollection from '~/modules/collections/helpers/exportCollection';
import { useCollectionActions } from '~/modules/collections/hooks/useCollectionActions';
import { ProjectService } from '~/modules/projects/project';
import getProjectRunsItemAttributes from '~/modules/projects/helpers/getProjectRunsItemAttributes';
import getProjectSessionsItemAttributes from '~/modules/projects/helpers/getProjectSessionsItemAttributes';
import { RunService } from '~/modules/runs/run';
import { SessionService } from '~/modules/sessions/session';
import ViewSessionContainer from '~/modules/sessions/containers/viewSessionContainer';
import type { Session } from '~/modules/sessions/sessions.types';
import ProjectAuthorization from '~/modules/projects/authorization';
import type { User } from '~/modules/users/users.types';
import type { Route } from './+types/collectionDetail.route';

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

  const collection = await CollectionService.findById(params.collectionId);
  if (!collection) {
    return redirect(`/projects/${params.projectId}/collections`);
  }

  // Fetch runs and sessions
  const runs = collection.runs?.length
    ? await RunService.find({ match: { _id: { $in: collection.runs || [] } } })
    : [];

  const sessions = collection.sessions?.length
    ? await SessionService.find({ match: { _id: { $in: collection.sessions || [] } } })
    : [];

  return {
    collection,
    project,
    runs,
    sessions
  };
}

export async function action({ request, params }: Route.ActionArgs) {
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

  switch (intent) {
    case 'EXPORT_COLLECTION': {
      const { exportType } = payload;
      await exportCollection({ collectionId: params.collectionId, exportType });
      return {};
    }
    default: {
      return data({ errors: { intent: 'Invalid intent' } }, { status: 400 });
    }
  }
}

export default function CollectionDetailRoute() {
  const { collection, project, runs, sessions } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const submit = useSubmit();
  const navigate = useNavigate();

  const {
    openEditCollectionDialog,
    openDeleteCollectionDialog
  } = useCollectionActions({
    projectId: project._id,
    collectionId: collection._id,
    onDeleteSuccess: () => {
      navigate(`/projects/${project._id}/collections`);
    }
  });

  const debounceRevalidate = throttle(() => {
    revalidator.revalidate();
  }, 500);

  const onExportCollectionButtonClicked = ({ exportType }: { exportType: string }) => {
    submit(JSON.stringify({
      intent: 'EXPORT_COLLECTION',
      payload: {
        exportType
      }
    }), { method: 'POST', encType: 'application/json' });
  };

  const onSessionItemClicked = (id: string) => {
    const session = find(sessions, { _id: id });
    if (!session) return;
    addDialog(
      <ViewSessionContainer
        session={session}
      />
    );
  };

  // Subscribe to run events for real-time updates
  useHandleSockets({
    event: 'ANNOTATE_RUN',
    matches: runs.map(run => [
      {
        runId: run._id,
        task: 'ANNOTATE_RUN:START',
        status: 'FINISHED'
      },
      {
        runId: run._id,
        task: 'ANNOTATE_RUN:PROCESS',
        status: 'STARTED'
      },
      {
        runId: run._id,
        task: 'ANNOTATE_RUN:PROCESS',
        status: 'FINISHED'
      },
      {
        runId: run._id,
        task: 'ANNOTATE_RUN:FINISH',
        status: 'FINISHED'
      }
    ]).flat(),
    callback: () => {
      debounceRevalidate();
    }
  });

  useEffect(() => {
    updateBreadcrumb([
      { text: 'Projects', link: '/' },
      { text: project.name, link: `/projects/${project._id}` },
      { text: 'Collections', link: `/projects/${project._id}/collections` },
      { text: collection.name }
    ]);
  }, [project._id, project.name, collection.name]);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.collectionId === collection._id) {
        switch (data.event) {
          case 'EXPORT_COLLECTION':
            debounceRevalidate();
            if (data.status === 'DONE') {
              const downloadUrl = `/api/downloads/${project._id}/collections/${collection._id}?exportType=CSV`;
              const a = document.createElement('a');
              a.href = downloadUrl;
              a.target = '_blank';
              a.rel = 'noopener';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
            break;
        }
      }
    };

    return () => {
      eventSource.close();
    }
  }, [collection._id]);

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">{collection.name}</h1>
        <div className="flex text-muted-foreground gap-1">
          {!collection.hasExportedCSV && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  disabled={collection.isExporting}
                  className="data-[state=open]:bg-muted flex"
                >
                  <Download />
                  {collection.isExporting ? <span>Exporting</span> : <span>Export</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExportCollectionButtonClicked({ exportType: 'CSV' })}>
                  As Table (.csv file)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted"
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/projects/${project._id}/collections/${collection._id}/add-runs`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Runs
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/projects/${project._id}/collections/${collection._id}/merge`)}>
                <GitMerge className="mr-2 h-4 w-4" />
                Merge
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openEditCollectionDialog(collection)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openDeleteCollectionDialog(collection)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div>
        {/* Overview Section */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-muted-foreground">Created</div>
            <div>
              {collection.createdAt ? new Date(collection.createdAt).toLocaleDateString() : '--'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Sessions</div>
            <div>{collection.sessions?.length || 0}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Runs</div>
            <div>{collection.runs?.length || 0}</div>
          </div>
        </div>

        {/* Sessions Section */}
        {sessions.length > 0 && (
          <div className="mt-8">
            <div className="text-xs text-muted-foreground">Sessions</div>
            <div className="border rounded-md mt-2">
              <Collection
                items={sessions}
                itemsLayout="list"
                getItemAttributes={getProjectSessionsItemAttributes}
                getItemActions={() => []}
                onActionClicked={() => {}}
                onItemClicked={onSessionItemClicked}
                emptyAttributes={{
                  title: 'No sessions found',
                  description: ''
                }}
                currentPage={1}
                totalPages={1}
                onPaginationChanged={() => {}}
                filters={[]}
                filtersValues={{}}
                onSortValueChanged={() => {}}
              />
            </div>
          </div>
        )}

        {/* Runs Section */}
        {runs.length > 0 && (
          <div className="mt-8">
            <div className="text-xs text-muted-foreground">Runs</div>
            <div className="border rounded-md mt-2">
              <Collection
                items={runs}
                itemsLayout="list"
                getItemAttributes={getProjectRunsItemAttributes}
                getItemActions={() => []}
                onActionClicked={() => {}}
                emptyAttributes={{
                  title: 'No runs found',
                  description: ''
                }}
                currentPage={1}
                totalPages={1}
                onPaginationChanged={() => {}}
                filters={[]}
                filtersValues={{}}
                onSortValueChanged={() => {}}
              />
            </div>
          </div>
        )}
        <CollectionDownloads
          collection={collection}
          projectId={project._id}
        />
      </div>
    </div>
  );
}
