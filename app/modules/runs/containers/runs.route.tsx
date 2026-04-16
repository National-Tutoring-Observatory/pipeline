import find from "lodash/find";
import map from "lodash/map";
import {
  redirect,
  useLoaderData,
  useNavigate,
  useParams,
  useRevalidator,
} from "react-router";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import useHandleSockets from "~/modules/app/hooks/useHandleSockets";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import { ProjectService } from "~/modules/projects/project";
import { useCreateRunSetForRun } from "~/modules/runs/hooks/useCreateRunSetForRun";
import { useRunActions } from "~/modules/runs/hooks/useRunActions";
import { RunService } from "~/modules/runs/run";
import type { Run } from "~/modules/runs/runs.types";
import Runs from "../components/runs";
import type { Route } from "./+types/runs.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAuth({ request });

  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, "team");
  const project = await ProjectService.findOne({
    _id: params.id,
    team: { $in: teamIds },
  });
  if (!project) {
    return redirect("/");
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
    sort: "name",
    filters: {},
  });

  const query = buildQueryFromParams({
    match: { project: params.id, isHuman: { $ne: true } },
    queryParams,
    searchableFields: ["name"],
    sortableFields: ["name", "createdAt"],
    filterableFields: ["annotationType"],
  });

  const pagination = getPaginationParams(query.page);

  const runs = await RunService.find({
    match: query.match,
    populate: ["prompt"],
    sort: query.sort,
    pagination,
  });

  const total = await RunService.count(query.match);

  return { runs: { data: runs, totalPages: getTotalPages(total) } };
}

export default function ProjectRunsRoute() {
  const { runs } = useLoaderData();
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();
  const { openCreateRunSetDialog } = useCreateRunSetForRun({
    projectId: projectId!,
  });
  const { openEditRunDialog, openDeleteRunDialog } = useRunActions({
    projectId: projectId!,
  });

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

  const onCreateRunButtonClicked = () => {
    navigate(`/projects/${projectId}/create-run`);
  };

  const onDuplicateRunButtonClicked = (run: Run) => {
    navigate(`/projects/${projectId}/create-run?duplicateFrom=${run._id}`);
  };

  const onActionClicked = (action: string) => {
    if (action === "CREATE") {
      onCreateRunButtonClicked();
    }
  };

  const onItemActionClicked = ({
    id,
    action,
  }: {
    id: string;
    action: string;
  }) => {
    const run = find(runs.data, { _id: id });
    if (!run) return null;
    switch (action) {
      case "EDIT":
        openEditRunDialog(run);
        break;
      case "DUPLICATE":
        onDuplicateRunButtonClicked(run);
        break;
      case "DELETE":
        openDeleteRunDialog(run);
        break;
      case "ADD_TO_EXISTING_RUN_SET":
        navigate(`/projects/${projectId}/runs/${id}/add-to-run-set`);
        break;
      case "ADD_TO_NEW_RUN_SET":
        openCreateRunSetDialog(id);
        break;
      case "USE_AS_RUN_SET_TEMPLATE":
        navigate(`/projects/${projectId}/create-run-set?fromRun=${id}`);
        break;
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

  useHandleSockets({
    event: "ANNOTATE_RUN",
    matches: [
      {
        task: "ANNOTATE_RUN:START",
        status: "FINISHED",
      },
      {
        task: "ANNOTATE_RUN:FINISH",
        status: "FINISHED",
      },
    ],
    callback: () => {
      revalidate();
    },
  });

  return (
    <Runs
      runs={runs.data}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={runs.totalPages}
      filtersValues={filtersValues}
      sortValue={sortValue}
      isSyncing={isSyncing}
      onActionClicked={onActionClicked}
      onItemActionClicked={onItemActionClicked}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
      onFiltersValueChanged={onFiltersValueChanged}
      onSortValueChanged={onSortValueChanged}
    />
  );
}
