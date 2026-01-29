import find from "lodash/find";
import {
  data,
  redirect,
  useLoaderData,
  useNavigate,
  useParams,
  useRevalidator,
  useSubmit,
} from "react-router";
import { toast } from "sonner";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import useHandleSockets from "~/modules/app/hooks/useHandleSockets";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import type { Run } from "~/modules/runs/runs.types";
import EditRunDialog from "../components/editRunDialog";
import ProjectRuns from "../components/projectRuns";
import type { Route } from "./+types/projectRuns.route";

export async function loader({ request, params }: Route.LoaderArgs) {
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

export async function action({ request, params }: Route.ActionArgs) {
  const { intent, entityId, payload = {} } = await request.json();

  const user = await getSessionUser({ request });
  if (!user) {
    return redirect("/");
  }

  const { name } = payload;

  const project = await ProjectService.findById(params.id);
  if (!project) {
    return data({ errors: { project: "Project not found" } }, { status: 400 });
  }
  switch (intent) {
    case "UPDATE_RUN": {
      if (typeof name !== "string") {
        throw new Error("Run name is required and must be a string.");
      }

      if (!ProjectAuthorization.Runs.canManage(user, project)) {
        throw new Error(
          "You do not have permission to update runs in this project.",
        );
      }

      const existingRun = await RunService.findById(entityId);
      if (!existingRun) {
        throw new Error("Run not found.");
      }

      await RunService.updateById(entityId, { name });
      return {};
    }
    default: {
      return {};
    }
  }
}

export default function ProjectRunsRoute() {
  const { runs } = useLoaderData();
  const { id: projectId } = useParams();
  const submit = useSubmit();
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();

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

  const onEditRunClicked = (run: Run) => {
    submit(
      JSON.stringify({
        intent: "UPDATE_RUN",
        entityId: run._id,
        payload: { name: run.name },
      }),
      { method: "PUT", encType: "application/json" },
    ).then(() => {
      toast.success("Updated run");
    });
  };

  const onEditRunButtonClicked = (run: Run) => {
    addDialog(<EditRunDialog run={run} onEditRunClicked={onEditRunClicked} />);
  };

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
        onEditRunButtonClicked(run);
        break;
      case "DUPLICATE":
        onDuplicateRunButtonClicked(run);
        break;
      case "CREATE_COLLECTION":
        navigate(`/projects/${projectId}/create-collection?fromRun=${id}`);
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
    callback: (payload) => {
      revalidate();
    },
  });

  return (
    <ProjectRuns
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
