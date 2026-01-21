import find from "lodash/find";
import { redirect, useLoaderData, useSubmit } from "react-router";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import ViewSessionContainer from "~/modules/sessions/containers/viewSessionContainer";
import { SessionService } from "~/modules/sessions/session";
import type { Session } from "~/modules/sessions/sessions.types";
import type { User } from "~/modules/users/users.types";
import ProjectAuthorization from "../authorization";
import ProjectSessions from "../components/projectSessions";
import { ProjectService } from "../project";
import createSessionsFromFiles from "../services/createSessionsFromFiles.server";
import type { Route } from "./+types/projectSessions.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const project = await ProjectService.findById(params.id);
  if (!project) {
    return redirect("/");
  }

  if (!ProjectAuthorization.canView(user, project)) {
    return redirect("/");
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
    sort: "name",
    filters: {},
  });

  const query = buildQueryFromParams({
    match: { project: params.id },
    queryParams,
    searchableFields: ["name"],
    sortableFields: ["name", "createdAt"],
    filterableFields: [],
  });

  const sessionsList = await SessionService.find({ ...query });
  const total = await SessionService.count(query.match);
  const pagination = getPaginationParams(query.page);
  const sessions = {
    data: sessionsList,
    totalPages: getTotalPages(total),
    currentPage: query.page || 1,
  };
  return { sessions, project };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const { intent } = await request.json();

  switch (intent) {
    case "RE_RUN": {
      await createSessionsFromFiles({
        projectId: params.id,
        shouldCreateSessionModels: false,
      });

      return await ProjectService.updateById(params.id, {
        isConvertingFiles: true,
      });
    }
    default:
      return {};
  }
}

export default function ProjectSessionsRoute() {
  const { sessions, project } = useLoaderData();
  const submit = useSubmit();

  const {
    searchValue,
    setSearchValue,
    currentPage,
    setCurrentPage,
    sortValue,
    setSortValue,
    filtersValues,
    setFiltersValues,
    isSyncing,
  } = useSearchQueryParams({
    searchValue: "",
    currentPage: 1,
    sortValue: "name",
    filters: {},
  });

  const onSessionClicked = (session: Session) => {
    addDialog(<ViewSessionContainer session={session} />);
  };

  const onReRunClicked = () => {
    submit(
      JSON.stringify({
        intent: "RE_RUN",
        payload: {},
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  const onActionClicked = (action: string) => {
    if (action === "RE_RUN") {
      onReRunClicked();
    }
  };

  const onItemClicked = (id: string) => {
    const session = find(sessions.data, { _id: id });
    if (!session) return null;
    if (session.hasConverted) {
      onSessionClicked(session);
    }
  };

  const onSearchValueChanged = (searchValue: string) => {
    setSearchValue(searchValue);
  };

  const onPaginationChanged = (currentPage: number) => {
    setCurrentPage(currentPage);
  };

  const onFiltersValueChanged = (filterValue: any) => {
    setFiltersValues({ ...filtersValues, ...filterValue });
  };

  const onSortValueChanged = (sortValue: string) => {
    setSortValue(sortValue);
  };

  return (
    <ProjectSessions
      project={project}
      sessions={sessions.data}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={sessions.totalPages}
      filtersValues={filtersValues}
      sortValue={sortValue}
      isSyncing={isSyncing}
      onActionClicked={onActionClicked}
      onItemClicked={onItemClicked}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
      onFiltersValueChanged={onFiltersValueChanged}
      onSortValueChanged={onSortValueChanged}
    />
  );
}
