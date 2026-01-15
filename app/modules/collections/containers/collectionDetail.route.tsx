import { useEffect } from 'react';
import { redirect, useLoaderData, useRevalidator } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import throttle from 'lodash/throttle';
import updateBreadcrumb from '~/modules/app/updateBreadcrumb';
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import useHandleSockets from '~/modules/app/hooks/useHandleSockets';
import { CollectionService } from '~/modules/collections/collection';
import { ProjectService } from '~/modules/projects/project';
import { RunService } from '~/modules/runs/run';
import { SessionService } from '~/modules/sessions/session';
import ProjectAuthorization from '~/modules/projects/authorization';
import { getRunModelDisplayName } from '~/modules/runs/helpers/runModel';
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

export default function CollectionDetailRoute() {
  const { collection, project, runs, sessions } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const debounceRevalidate = throttle(() => {
    revalidator.revalidate();
  }, 500);

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{collection.name}</h1>
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
            <div className="border rounded-md overflow-auto max-h-80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>File Type</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session._id}>
                      <TableCell className="font-medium">{session.name || session._id}</TableCell>
                      <TableCell>{session.fileType || '--'}</TableCell>
                      <TableCell>
                        {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : '--'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Runs Section */}
        {runs.length > 0 && (
          <div className="bg-card rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Runs ({runs.length})</h2>
            <div className="border rounded-md overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prompt</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((run) => (
                    <TableRow key={run._id}>
                      <TableCell className="font-medium">{run.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {run.isRunning && <Badge variant="secondary">Running</Badge>}
                          {run.isComplete && <Badge variant="default">Complete</Badge>}
                          {run.hasErrored && <Badge variant="destructive">Error</Badge>}
                          {!run.isRunning && !run.isComplete && !run.hasErrored && <Badge variant="outline">Pending</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{run.prompt as string}</div>
                        {run.promptVersion && <div className="text-muted-foreground">v{run.promptVersion}</div>}
                      </TableCell>
                      <TableCell className="text-sm">{getRunModelDisplayName(run)}</TableCell>
                      <TableCell className="text-sm">{run.sessions?.length || 0}</TableCell>
                      <TableCell className="text-sm">
                        {run.createdAt ? new Date(run.createdAt).toLocaleDateString() : '--'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
