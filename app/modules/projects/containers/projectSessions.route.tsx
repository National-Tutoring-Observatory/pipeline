import find from 'lodash/find';
import { redirect, useLoaderData, useRouteLoaderData, useSubmit } from "react-router";
import buildQueryFromParams from '~/modules/app/helpers/buildQueryFromParams';
import getQueryParamsFromRequest from '~/modules/app/helpers/getQueryParamsFromRequest.server';
import { useSearchQueryParams } from '~/modules/app/hooks/useSearchQueryParams';
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import ViewSessionContainer from "~/modules/sessions/containers/viewSessionContainer";
import type { Session } from "~/modules/sessions/sessions.types";
import type { User } from "~/modules/users/users.types";
import ProjectAuthorization from "../authorization";
import ProjectSessions from "../components/projectSessions";
import type { Project } from "../projects.types";
import createSessionsFromFiles from "../services/createSessionsFromFiles.server";
import type { Route } from "./+types/projectSessions.route";

type Sessions = {
  data: [Session],
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();
  const project = await documents.getDocument<Project>({ collection: 'projects', match: { _id: params.id } });
  if (!project.data) {
    return redirect('/');
  }

  if (!ProjectAuthorization.canView(user, project.data)) {
    return redirect('/');
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: '',
    currentPage: 1,
    sort: 'name',
    filters: {}
  });

  const query = buildQueryFromParams({
    match: { project: params.id },
    queryParams,
    searchableFields: ['name'],
    sortableFields: ['name', 'createdAt'],
    filterableFields: []
  });

  const result = await documents.getDocuments<Session>({ collection: 'sessions', ...query });
  return { sessions: result };
}

export async function action({
  request,
  params,
  context
}: Route.ActionArgs) {

  const { intent } = await request.json();

  switch (intent) {
    case 'RE_RUN': {

      await createSessionsFromFiles({ projectId: params.id, shouldCreateSessionModels: false });

      const documents = getDocumentsAdapter();

      return await documents.updateDocument<Project>({ collection: 'projects', match: { _id: params.id }, update: { isConvertingFiles: true } });

    }
    default:
      return {};
  }
}

export default function ProjectSessionsRoute() {
  const { sessions } = useLoaderData();
  const { project } = useRouteLoaderData("project");
  const submit = useSubmit();

  const {
    searchValue, setSearchValue,
    currentPage, setCurrentPage,
    sortValue, setSortValue,
    filtersValues, setFiltersValues
  } = useSearchQueryParams({
    searchValue: '',
    currentPage: 1,
    sortValue: 'name',
    filters: {}
  });

  const onSessionClicked = (session: Session) => {
    addDialog(
      <ViewSessionContainer
        session={session}
      />
    );
  }

  const onReRunClicked = () => {
    submit(JSON.stringify({
      intent: 'RE_RUN',
      payload: {}
    }), { method: 'POST', encType: 'application/json' });
  }

  const onActionClicked = (action: string) => {
    if (action === 'RE_RUN') {
      onReRunClicked();
    }
  }

  const onItemClicked = (id: string) => {
    const session = find(sessions.data, { _id: id });
    if (!session) return null;
    if (session.hasConverted) {
      onSessionClicked(session);
    }
  }

  const onSearchValueChanged = (searchValue: string) => {
    setSearchValue(searchValue);
  }

  const onPaginationChanged = (currentPage: number) => {
    setCurrentPage(currentPage);
  }

  const onFiltersValueChanged = (filterValue: any) => {
    setFiltersValues({ ...filtersValues, ...filterValue });
  }

  const onSortValueChanged = (sortValue: string) => {
    setSortValue(sortValue);
  }

  return (
    <ProjectSessions
      project={project.data}
      sessions={sessions.data}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={sessions.totalPages}
      filtersValues={filtersValues}
      sortValue={sortValue}
      onActionClicked={onActionClicked}
      onItemClicked={onItemClicked}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
      onFiltersValueChanged={onFiltersValueChanged}
      onSortValueChanged={onSortValueChanged}
    />
  )
}
