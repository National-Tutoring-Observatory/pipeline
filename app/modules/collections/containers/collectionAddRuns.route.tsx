import { useEffect, useState } from 'react';
import { data, redirect, useLoaderData, useNavigate, useSubmit } from 'react-router';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import includes from 'lodash/includes';
import cloneDeep from 'lodash/cloneDeep';
import pull from 'lodash/pull';
import map from 'lodash/map';
import updateBreadcrumb from '~/modules/app/updateBreadcrumb';
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { CollectionService } from '~/modules/collections/collection';
import { ProjectService } from '~/modules/projects/project';
import ProjectAuthorization from '~/modules/projects/authorization';
import type { User } from '~/modules/users/users.types';
import type { Route } from './+types/collectionAddRuns.route';

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

  const eligibleRuns = await CollectionService.findEligibleRunsForCollection(params.collectionId);

  return {
    collection,
    project,
    eligibleRuns: eligibleRuns.data,
    totalEligibleRuns: eligibleRuns.count
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
    case 'ADD_RUNS': {
      const { runIds } = payload;
      await CollectionService.addRunsToCollection(params.collectionId, runIds);
      return redirect(`/projects/${params.projectId}/collections/${params.collectionId}`);
    }
    default: {
      return data({ errors: { intent: 'Invalid intent' } }, { status: 400 });
    }
  }
}

export default function CollectionAddRunsRoute() {
  const { collection, project, eligibleRuns, totalEligibleRuns } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigate = useNavigate();
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);

  const onSelectAllToggled = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedRuns(map(eligibleRuns, '_id'));
    } else {
      setSelectedRuns([]);
    }
  };

  const onSelectRunToggled = ({ runId, isChecked }: { runId: string; isChecked: boolean }) => {
    const clonedSelectedRuns = cloneDeep(selectedRuns);
    if (isChecked) {
      clonedSelectedRuns.push(runId);
      setSelectedRuns(clonedSelectedRuns);
    } else {
      pull(clonedSelectedRuns, runId);
      setSelectedRuns(clonedSelectedRuns);
    }
  };

  const onAddRunsClicked = () => {
    submit(
      JSON.stringify({
        intent: 'ADD_RUNS',
        payload: { runIds: selectedRuns }
      }),
      { method: 'POST', encType: 'application/json' }
    );
  };

  const onCancelClicked = () => {
    navigate(`/projects/${project._id}/collections/${collection._id}`);
  };

  useEffect(() => {
    updateBreadcrumb([
      { text: 'Projects', link: '/' },
      { text: project.name, link: `/projects/${project._id}` },
      { text: 'Collections', link: `/projects/${project._id}/collections` },
      { text: collection.name, link: `/projects/${project._id}/collections/${collection._id}` },
      { text: 'Add Runs' }
    ]);
  }, [project._id, project.name, collection._id, collection.name]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">Add Runs</h1>
        <p className="text-muted-foreground mt-2">
          Select runs to add to "{collection.name}". Only compatible runs are shown.
        </p>
      </div>

      {eligibleRuns.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No eligible runs found.</p>
          <p className="text-sm mt-2">Runs must have the same sessions and annotation type as this collection.</p>
          <Button variant="outline" className="mt-4" onClick={onCancelClicked}>
            Go Back
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              {totalEligibleRuns} eligible run{totalEligibleRuns !== 1 ? 's' : ''} • {selectedRuns.length} selected
            </span>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <Checkbox
                      checked={selectedRuns.length === eligibleRuns.length && eligibleRuns.length > 0}
                      onCheckedChange={(checked) => onSelectAllToggled(Boolean(checked))}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eligibleRuns.map((run) => (
                  <TableRow key={run._id}>
                    <TableCell className="w-8">
                      <Checkbox
                        checked={includes(selectedRuns, run._id)}
                        onCheckedChange={(checked) =>
                          onSelectRunToggled({ runId: run._id, isChecked: Boolean(checked) })
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{run.name}</TableCell>
                    <TableCell>{run.snapshot?.model?.name || run.model || '-'}</TableCell>
                    <TableCell>
                      {run.isComplete ? 'Complete' : run.isRunning ? 'Running' : 'Pending'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onCancelClicked}>
              Cancel
            </Button>
            <Button onClick={onAddRunsClicked} disabled={selectedRuns.length === 0}>
              Add {selectedRuns.length} Run{selectedRuns.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
