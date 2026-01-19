import { useEffect } from 'react';
import { data, redirect, useLoaderData, useRevalidator, useSubmit } from 'react-router';
import find from 'lodash/find';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collection } from '@/components/ui/collection';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import throttle from 'lodash/throttle';
import updateBreadcrumb from '~/modules/app/updateBreadcrumb';
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import useHandleSockets from '~/modules/app/hooks/useHandleSockets';
import addDialog from '~/modules/dialogs/addDialog';
import { CollectionService } from '~/modules/collections/collection';
import exportCollection from '~/modules/collections/helpers/exportCollection';
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
        <h1 className="text-3xl font-bold mb-2">{collection.name}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={collection.isExporting}>
              {collection.isExporting ? <span>Exporting</span> : <span>Export</span>}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!collection.hasExportedCSV && (
              <DropdownMenuItem onClick={() => onExportCollectionButtonClicked({ exportType: 'CSV' })}>
                As Table (.csv file)
              </DropdownMenuItem>
            )}
            {collection.hasExportedCSV && (
              <DropdownMenuItem asChild>
                <a href={`/api/downloads/${project._id}/collections/${collection._id}?exportType=CSV`} target="_blank" rel="noopener">
                  Download CSV
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-8">
        {/* Overview Section */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="text-xs text-muted-foreground mb-1">Created</div>
            <div className="text-sm font-medium">
              {collection.createdAt ? new Date(collection.createdAt).toLocaleDateString() : '--'}
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-xs text-muted-foreground mb-1">Sessions</div>
            <div className="text-sm font-medium">{collection.sessions?.length || 0}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-xs text-muted-foreground mb-1">Runs</div>
            <div className="text-sm font-medium">{collection.runs?.length || 0}</div>
          </div>
        </div>

        {/* Sessions Section */}
        {sessions.length > 0 && (
          <div className="bg-card rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Sessions ({sessions.length})</h2>
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
        )}

        {/* Runs Section */}
        {runs.length > 0 && (
          <div className="bg-card rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Runs ({runs.length})</h2>
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
        )}
      </div>
    </div>
  );
}
