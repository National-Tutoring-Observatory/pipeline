import { useEffect } from "react";
import { data, redirect, useLoaderData, useNavigate } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { CollectionService } from "~/modules/collections/collection";
import type { Collection } from "~/modules/collections/collections.types";
import { useCollectionActions } from "~/modules/collections/hooks/useCollectionActions";
import hasFeatureFlag from "~/modules/featureFlags/helpers/hasFeatureFlag";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import type { User } from "~/modules/users/users.types";
import CollectionsList from "../components/collectionsList";
import type { Route } from "./+types/collectionsList.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const project = await ProjectService.findById(params.id);
  if (!project) {
    return redirect('/');
  }

  if (!ProjectAuthorization.canView(user, project)) {
    return redirect('/');
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: '',
    currentPage: 1,
    sort: '-createdAt',
    filters: {}
  });

  const query = buildQueryFromParams({
    match: { project: params.id },
    queryParams,
    searchableFields: ['name'],
    sortableFields: ['name', 'createdAt']
  });

  const collections = await CollectionService.paginate(query);

  const hasCollectionsFeature = await hasFeatureFlag('HAS_PROJECT_COLLECTIONS', { request }, { defaultValue: false });

  return { collections, project, hasCollectionsFeature };
}

export async function action({
  request,
  params,
}: Route.ActionArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const project = await ProjectService.findById(params.id);
  if (!project) {
    throw new Error('Project not found');
  }

  if (!ProjectAuthorization.Runs.canManage(user, project)) {
    return data({ errors: { project: 'Access denied' } }, { status: 403 });
  }

  const body = await request.json();
  const { intent, entityId, payload = {} } = body;

  const { name, annotationType } = payload;
  let collection;

  switch (intent) {
    case 'CREATE_COLLECTION': {
      if (typeof name !== "string") {
        throw new Error("Collection name is required and must be a string.");
      }
      if (typeof annotationType !== "string") {
        throw new Error("Annotation type is required and must be a string.");
      }
      collection = await CollectionService.create({
        project: params.id,
        name,
        sessions: [],
        runs: [],
        hasSetup: false,
        annotationType
      });
      return {
        intent: 'CREATE_COLLECTION',
        ...collection
      }
    }
    case 'UPDATE_COLLECTION': {

      if (typeof name !== "string") {
        throw new Error("Collection name is required and must be a string.");
      }
      await CollectionService.updateById(entityId, {
        name
      });
      return {};
    }
    case 'DUPLICATE_COLLECTION': {

      if (typeof name !== "string") {
        throw new Error("Collection name is required and must be a string.");
      }
      const existingCollection = await CollectionService.findById(entityId);

      if (!existingCollection) {
        throw new Error('Collection not found');
      }

      collection = await CollectionService.create({
        project: existingCollection.project,
        name: name,
        sessions: existingCollection.sessions,
        runs: existingCollection.runs || [],
        hasSetup: true,
        annotationType: existingCollection.annotationType
      });
      return {
        intent: 'DUPLICATE_COLLECTION',
        ...collection
      };
    }
    case 'DELETE_COLLECTION': {
      await CollectionService.deleteWithCleanup(entityId);

      return {
        intent: 'DELETE_COLLECTION'
      };
    }
    default: {
      return {};
    }
  }
}

export default function CollectionsListRoute() {
  const { collections, project, hasCollectionsFeature } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const {
    openEditCollectionDialog,
    openDeleteCollectionDialog,
    openDuplicateCollectionDialog
  } = useCollectionActions({
    projectId: project._id
  });

  const {
    searchValue, setSearchValue,
    currentPage, setCurrentPage,
    sortValue, setSortValue,
    isSyncing
  } = useSearchQueryParams({
    searchValue: '',
    currentPage: 1,
    sortValue: 'createdAt'
  });

  useEffect(() => {
    updateBreadcrumb([
      { text: 'Projects', link: '/' },
      { text: project.name, link: `/projects/${project._id}` },
      { text: 'Collections' }
    ]);
  }, [project._id, project.name]);

  const onSearchValueChanged = (searchValue: string) => {
    setSearchValue(searchValue);
  }

  const onPaginationChanged = (currentPage: number) => {
    setCurrentPage(currentPage);
  }

  const onSortValueChanged = (sortValue: string) => {
    setSortValue(sortValue);
  }

  const onCreateCollectionButtonClicked = () => {
    navigate(`/projects/${project._id}/create-collection`);
  }

  const onUseAsTemplateButtonClicked = (collection: Collection) => {
    navigate(`/projects/${project._id}/create-collection?fromCollection=${collection._id}`);
  }

  return (
    <CollectionsList
      collections={collections?.data}
      totalPages={collections.totalPages}
      searchValue={searchValue}
      currentPage={currentPage}
      sortValue={sortValue}
      isSyncing={isSyncing}
      hasCollectionsFeature={hasCollectionsFeature}
      onCreateCollectionButtonClicked={onCreateCollectionButtonClicked}
      onEditCollectionButtonClicked={openEditCollectionDialog}
      onDuplicateCollectionButtonClicked={openDuplicateCollectionDialog}
      onUseAsTemplateButtonClicked={onUseAsTemplateButtonClicked}
      onDeleteCollectionButtonClicked={openDeleteCollectionDialog}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
      onSortValueChanged={onSortValueChanged}
    />
  )
}
