import { useEffect } from "react";
import { data, redirect, useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { CollectionService } from "~/modules/collections/collection";
import type { Collection } from "~/modules/collections/collections.types";
import DeleteCollectionDialog from "~/modules/collections/components/deleteCollectionDialog";
import DuplicateCollectionDialog from "~/modules/collections/components/duplicateCollectionDialog";
import EditCollectionDialog from "~/modules/collections/components/editCollectionDialog";
import addDialog from "~/modules/dialogs/addDialog";
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

  return { collections, project };
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

  const { intent, entityId, payload = {} } = await request.json();

  const { name } = payload;
  let collection;

  switch (intent) {
    case 'CREATE_COLLECTION': {
      if (typeof name !== "string") {
        throw new Error("Collection name is required and must be a string.");
      }
      collection = await CollectionService.create({
        project: params.id,
        name,
        sessions: [],
        runs: [],
        hasSetup: false
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

      const { project, sessions, runs } = existingCollection;

      collection = await CollectionService.create({
        project,
        name: name,
        sessions,
        runs: runs || [],
        hasSetup: true
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

export default function CollectionsListRoute({ loaderData }: Route.ComponentProps) {
  const { collections, project } = loaderData;
  const navigate = useNavigate();
  const editFetcher = useFetcher();
  const duplicateFetcher = useFetcher();
  const deleteFetcher = useFetcher();

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

  useEffect(() => {
    if (editFetcher.state === 'idle' && editFetcher.data) {
      if (editFetcher.data.intent === 'UPDATE_COLLECTION') {
        toast.success('Collection updated');
        addDialog(null);
      }
    }
  }, [editFetcher.state, editFetcher.data]);

  useEffect(() => {
    if (duplicateFetcher.state === 'idle' && duplicateFetcher.data) {
      if (duplicateFetcher.data.intent === 'DUPLICATE_COLLECTION') {
        toast.success('Collection duplicated');
        addDialog(null);
        navigate(`/projects/${duplicateFetcher.data.project}/collections/${duplicateFetcher.data._id}`);
      }
    }
  }, [duplicateFetcher.state, duplicateFetcher.data, navigate]);

  useEffect(() => {
    if (deleteFetcher.state === 'idle' && deleteFetcher.data) {
      if (deleteFetcher.data.intent === 'DELETE_COLLECTION') {
        toast.success('Collection deleted');
        addDialog(null);
      }
    }
  }, [deleteFetcher.state, deleteFetcher.data]);

  const openEditCollectionDialog = (collection: Collection) => {
    addDialog(<EditCollectionDialog
      collection={collection}
      onEditCollectionClicked={submitEditCollection}
    />);
  }

  const openDuplicateCollectionDialog = (collection: Collection) => {
    addDialog(<DuplicateCollectionDialog
      collection={collection}
      onDuplicateNewCollectionClicked={submitDuplicateCollection}
    />);
  }

  const openDeleteCollectionDialog = (collection: Collection) => {
    addDialog(<DeleteCollectionDialog
      collection={collection}
      onDeleteCollectionClicked={submitDeleteCollection}
    />);
  }

  const submitEditCollection = (collection: Collection) => {
    editFetcher.submit(
      JSON.stringify({ intent: 'UPDATE_COLLECTION', entityId: collection._id, payload: { name: collection.name } }),
      { method: 'PUT', encType: 'application/json' }
    );
  }

  const submitDuplicateCollection = ({ name, collectionId }: { name: string, collectionId: string }) => {
    duplicateFetcher.submit(
      JSON.stringify({ intent: 'DUPLICATE_COLLECTION', entityId: collectionId, payload: { name } }),
      { method: 'POST', encType: 'application/json' }
    );
  }

  const submitDeleteCollection = (collectionId: string) => {
    deleteFetcher.submit(
      JSON.stringify({ intent: 'DELETE_COLLECTION', entityId: collectionId }),
      { method: 'DELETE', encType: 'application/json' }
    );
  }

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
