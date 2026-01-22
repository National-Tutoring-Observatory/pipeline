import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collection } from '@/components/ui/collection';
import { PageHeader, PageHeaderLeft } from '@/components/ui/pageHeader';
import dayjs from 'dayjs';
import cloneDeep from 'lodash/cloneDeep';
import includes from 'lodash/includes';
import map from 'lodash/map';
import pull from 'lodash/pull';
import { useState } from 'react';
import { data, redirect, useLoaderData, useNavigate, useSubmit } from 'react-router';
import Breadcrumbs from '~/modules/app/components/breadcrumbs';
import getQueryParamsFromRequest from '~/modules/app/helpers/getQueryParamsFromRequest.server';
import { useSearchQueryParams } from '~/modules/app/hooks/useSearchQueryParams';
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { CollectionService } from '~/modules/collections/collection';
import type { Collection as CollectionType } from '~/modules/collections/collections.types';
import requireCollectionsFeature from '~/modules/collections/helpers/requireCollectionsFeature';
import ProjectAuthorization from '~/modules/projects/authorization';
import { ProjectService } from '~/modules/projects/project';
import type { User } from '~/modules/users/users.types';
import type { Route } from './+types/collectionMerge.route';

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

  await requireCollectionsFeature(request, params);

  const collection = await CollectionService.findById(params.collectionId);
  if (!collection) {
    return redirect(`/projects/${params.projectId}/collections`);
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
  });

  const mergeableCollectionsResult =
    await CollectionService.findMergeableCollections(params.collectionId, {
      page: queryParams.currentPage || 1,
      pageSize: 10,
      search: queryParams.searchValue || "",
    });

  return {
    collection,
    project,
    mergeableCollections: mergeableCollectionsResult.data,
    totalMergeableCollections: mergeableCollectionsResult.count,
    totalPages: mergeableCollectionsResult.totalPages,
  };
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

  switch (intent) {
    case "MERGE_COLLECTIONS": {
      const { sourceCollectionIds } = payload;
      await CollectionService.mergeCollections(
        params.collectionId,
        sourceCollectionIds,
      );
      return redirect(
        `/projects/${params.projectId}/collections/${params.collectionId}`,
      );
    }
    default: {
      return data({ errors: { intent: "Invalid intent" } }, { status: 400 });
    }
  }
}

export default function CollectionMergeRoute() {
  const {
    collection,
    project,
    mergeableCollections,
    totalMergeableCollections,
    totalPages,
  } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigate = useNavigate();
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const {
    searchValue,
    setSearchValue,
    currentPage,
    setCurrentPage,
    isSyncing,
  } = useSearchQueryParams({
    searchValue: "",
    currentPage: 1,
  });

  const onSelectAllToggled = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedCollections(map(mergeableCollections, "_id"));
    } else {
      setSelectedCollections([]);
    }
  };

  const onSelectCollectionToggled = (
    collectionId: string,
    isChecked: boolean,
  ) => {
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
        intent: "MERGE_COLLECTIONS",
        payload: { sourceCollectionIds: selectedCollections },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  const onCancelClicked = () => {
    navigate(`/projects/${project._id}/collections/${collection._id}`);
  };

  const totalRuns = selectedCollections.reduce((sum, id) => {
    const coll = mergeableCollections.find((c) => c._id === id);
    return sum + (coll?.runs?.length || 0);
  }, 0);

  const getItemAttributes = (coll: CollectionType) => ({
    id: coll._id,
    title: coll.name,
    meta: [
      { text: `${coll.runs?.length || 0} runs` },
      {
        text: coll.createdAt ? dayjs(coll.createdAt).format("MMM D, YYYY") : "",
      },
    ],
  });

  const renderItem = (coll: CollectionType) => (
    <div className="flex w-full items-center gap-4 p-4">
      <Checkbox
        checked={includes(selectedCollections, coll._id)}
        onCheckedChange={(checked) =>
          onSelectCollectionToggled(coll._id, Boolean(checked))
        }
        onClick={(e) => e.stopPropagation()}
      />
      <div className="min-w-0 flex-1">
        <div className="font-medium">{coll.name}</div>
        <div className="text-muted-foreground flex gap-4 text-sm">
          <span>{coll.runs?.length || 0} runs</span>
          <span>
            {coll.createdAt ? dayjs(coll.createdAt).format("MMM D, YYYY") : ""}
          </span>
        </div>
      </div>
    </div>
  );

  const breadcrumbs = [
    { text: 'Projects', link: '/' },
    { text: project.name, link: `/projects/${project._id}` },
    { text: 'Collections', link: `/projects/${project._id}/collections` },
    { text: collection.name, link: `/projects/${project._id}/collections/${collection._id}` },
    { text: 'Merge' }
  ];

  const allSelected =
    mergeableCollections.length > 0 &&
    selectedCollections.length === mergeableCollections.length;

  return (
    <div className="p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>
      <div className="mb-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Merge Collections
        </h1>
        <p className="text-muted-foreground mt-2">
          Select collections to merge into "{collection.name}". Only compatible
          collections are shown.
        </p>
      </div>

      {totalMergeableCollections === 0 && !searchValue ? (
        <div className="text-muted-foreground py-12 text-center">
          <p>No compatible collections found.</p>
          <p className="mt-2 text-sm">
            Collections must have the same sessions and annotation type.
          </p>
          <Button variant="outline" className="mt-4" onClick={onCancelClicked}>
            Go Back
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-4">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) =>
                onSelectAllToggled(Boolean(checked))
              }
            />
            <span className="text-muted-foreground text-sm">
              Select all ({selectedCollections.length} of{" "}
              {totalMergeableCollections} selected, {totalRuns} runs)
            </span>
          </div>

          <Collection
            items={mergeableCollections}
            itemsLayout="list"
            hasSearch
            hasPagination
            searchValue={searchValue}
            currentPage={currentPage}
            totalPages={totalPages}
            isSyncing={isSyncing}
            emptyAttributes={{
              title: "No collections found",
              description: searchValue
                ? "Try a different search term"
                : "No compatible collections available",
            }}
            getItemAttributes={getItemAttributes}
            getItemActions={() => []}
            renderItem={renderItem}
            onItemClicked={(id) => {
              const isSelected = includes(selectedCollections, id);
              onSelectCollectionToggled(id, !isSelected);
            }}
            onActionClicked={() => { }}
            onSearchValueChanged={setSearchValue}
            onPaginationChanged={setCurrentPage}
            onFiltersValueChanged={() => { }}
            onSortValueChanged={() => { }}
            filters={[]}
            filtersValues={{}}
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onCancelClicked}>
              Cancel
            </Button>
            <Button
              onClick={onMergeClicked}
              disabled={selectedCollections.length === 0}
            >
              Merge {selectedCollections.length} Collection
              {selectedCollections.length !== 1 ? "s" : ""} ({totalRuns} runs)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
