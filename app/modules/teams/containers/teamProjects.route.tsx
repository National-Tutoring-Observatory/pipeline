import find from "lodash/find";
import {
  redirect,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import ProjectAuthorization from "~/modules/projects/authorization";
import CreateProjectDialog from "~/modules/projects/components/createProjectDialog";
import { ProjectService } from "~/modules/projects/project";
import TeamAuthorization from "../authorization";
import TeamProjects from "../components/teamProjects";
import type { Route } from "./+types/teamProjects.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (!user) {
    return redirect("/");
  }
  if (!TeamAuthorization.canView(user, params.id)) {
    return redirect("/");
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
    sort: "name",
    filters: {},
  });

  const query = buildQueryFromParams({
    match: { team: params.id },
    queryParams,
    searchableFields: ["name"],
    sortableFields: ["name", "createdAt"],
    filterableFields: [],
  });

  const pagination = getPaginationParams(query.page);

  const result = await ProjectService.find({
    match: query.match,
    sort: query.sort,
    pagination,
  });

  const total = await ProjectService.count(query.match);

  return {
    projects: {
      data: result,
      totalPages: getTotalPages(total),
      currentPage: query.page || 1,
    },
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { intent, payload = {} } = await request.json();
  const { name } = payload;

  const user = await getSessionUser({ request });
  if (!user) return { redirect: "/" };

  if (!ProjectAuthorization.canCreate(user, params.id)) {
    throw new Error(
      "You do not have permission to create a project in this team.",
    );
  }

  if (intent === "CREATE_PROJECT") {
    if (typeof name !== "string")
      throw new Error("Project name is required and must be a string.");
    const project = await ProjectService.create({
      name,
      team: params.id,
      createdBy: user._id,
    });
    return {
      intent: "CREATE_PROJECT",
      data: project,
    };
  }

  return {};
}

export default function TeamProjectsRoute() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();
  const ctx = useOutletContext<any>();
  const navigate = useNavigate();
  const teamId = params.id;

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

  const onCreateProjectButtonClicked = () => {
    addDialog(
      <CreateProjectDialog
        hasTeamSelection={false}
        teamId={teamId}
        onProjectCreated={(project) => {
          navigate(`/projects/${project._id}`);
        }}
      />,
    );
  };

  const onActionClicked = (action: string) => {
    if (action === "CREATE") {
      onCreateProjectButtonClicked();
    }
  };

  const onItemActionClicked = ({
    id,
    action,
  }: {
    id: string;
    action: string;
  }) => {
    const project = find(data.projects.data, { _id: id });
    if (!project) return null;
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

  const projects = data.projects.data ?? [];

  return (
    <TeamProjects
      projects={projects}
      team={ctx.team}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={data.projects.totalPages}
      filtersValues={filtersValues}
      sortValue={sortValue}
      isSyncing={isSyncing}
      onActionClicked={onActionClicked}
      onItemActionClicked={onItemActionClicked}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
      onFiltersValueChanged={onFiltersValueChanged}
      onSortValueChanged={onSortValueChanged}
      onCreateProjectButtonClicked={onCreateProjectButtonClicked}
    />
  );
}
