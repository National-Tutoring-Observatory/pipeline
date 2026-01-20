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
import type { Route } from './+types/collectionMerge.route';

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

  const mergeableCollections = await CollectionService.findMergeableCollections(params.collectionId);

  return {
    collection,
    project,
    mergeableCollections
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
    case 'MERGE_COLLECTIONS': {
      const { sourceCollectionIds } = payload;
      await CollectionService.mergeCollections(params.collectionId, sourceCollectionIds);
      return redirect(`/projects/${params.projectId}/collections/${params.collectionId}`);
    }
    default: {
      return data({ errors: { intent: 'Invalid intent' } }, { status: 400 });
    }
  }
}

export default function CollectionMergeRoute() {
  const { collection, project, mergeableCollections } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigate = useNavigate();
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const onSelectAllToggled = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedCollections(map(mergeableCollections, '_id'));
    } else {
      setSelectedCollections([]);
    }
  };

  const onSelectCollectionToggled = ({ collectionId, isChecked }: { collectionId: string; isChecked: boolean }) => {
    const clonedSelectedCollections = cloneDeep(selectedCollections);
    if (isChecked) {
      clonedSelectedCollections.push(collectionId);
      setSelectedCollections(clonedSelectedCollections);
    } else {
      pull(clonedSelectedCollections, collectionId);
      setSelectedCollections(clonedSelectedCollections);
    }
  };

  const onMergeClicked = () => {
    submit(
      JSON.stringify({
        intent: 'MERGE_COLLECTIONS',
        payload: { sourceCollectionIds: selectedCollections }
      }),
      { method: 'POST', encType: 'application/json' }
    );
  };

  const onCancelClicked = () => {
    navigate(`/projects/${project._id}/collections/${collection._id}`);
  };

  const totalRuns = selectedCollections.reduce((sum, id) => {
    const coll = mergeableCollections.find(c => c._id === id);
    return sum + (coll?.runs?.length || 0);
  }, 0);

  useEffect(() => {
    updateBreadcrumb([
      { text: 'Projects', link: '/' },
      { text: project.name, link: `/projects/${project._id}` },
      { text: 'Collections', link: `/projects/${project._id}/collections` },
      { text: collection.name, link: `/projects/${project._id}/collections/${collection._id}` },
      { text: 'Merge' }
    ]);
  }, [project._id, project.name, collection._id, collection.name]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">Merge Collections</h1>
        <p className="text-muted-foreground mt-2">
          Select collections to merge into "{collection.name}". Only compatible collections are shown.
        </p>
      </div>

      {mergeableCollections.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No compatible collections found.</p>
          <p className="text-sm mt-2">Collections must have the same sessions and annotation type.</p>
          <Button variant="outline" className="mt-4" onClick={onCancelClicked}>
            Go Back
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              {mergeableCollections.length} compatible collection{mergeableCollections.length !== 1 ? 's' : ''} • {selectedCollections.length} selected ({totalRuns} runs)
            </span>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <Checkbox
                      checked={selectedCollections.length === mergeableCollections.length && mergeableCollections.length > 0}
                      onCheckedChange={(checked) => onSelectAllToggled(Boolean(checked))}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Runs</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mergeableCollections.map((coll) => (
                  <TableRow key={coll._id}>
                    <TableCell className="w-8">
                      <Checkbox
                        checked={includes(selectedCollections, coll._id)}
                        onCheckedChange={(checked) =>
                          onSelectCollectionToggled({ collectionId: coll._id, isChecked: Boolean(checked) })
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{coll.name}</TableCell>
                    <TableCell>{coll.runs?.length || 0}</TableCell>
                    <TableCell>
                      {coll.createdAt ? new Date(coll.createdAt).toLocaleDateString() : '-'}
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
            <Button onClick={onMergeClicked} disabled={selectedCollections.length === 0}>
              Merge {selectedCollections.length} Collection{selectedCollections.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
