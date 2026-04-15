import { data, redirect, useNavigate } from "react-router";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { useRunSetActions } from "~/modules/runSets/hooks/useRunSetActions";
import { RunSetService } from "~/modules/runSets/runSet";
import type { RunSet } from "~/modules/runSets/runSets.types";
import type { User } from "~/modules/users/users.types";
import RunSetsList from "../components/runSetsList";
import type { Route } from "./+types/runSetsList.route";

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
    sort: "-createdAt",
    filters: {},
  });

  const query = buildQueryFromParams({
    match: { project: params.id },
    queryParams,
    searchableFields: ["name"],
    sortableFields: ["name", "createdAt"],
  });

  const runSets = await RunSetService.paginate(query);

  return { runSets, project };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const project = await ProjectService.findById(params.id);
  if (!project) {
    throw new Error("Project not found");
  }

  if (!ProjectAuthorization.Runs.canManage(user, project)) {
    return data({ errors: { project: "Access denied" } }, { status: 403 });
  }

  const body = await request.json();
  const { intent, entityId, payload = {} } = body;

  const { name, annotationType } = payload;
  let runSet;

  switch (intent) {
    case "CREATE_RUN_SET": {
      if (typeof name !== "string") {
        throw new Error("Run set name is required and must be a string.");
      }
      if (typeof annotationType !== "string") {
        throw new Error("Annotation type is required and must be a string.");
      }
      runSet = await RunSetService.create({
        project: params.id,
        name,
        sessions: [],
        runs: [],
        hasSetup: false,
        annotationType,
      });
      return {
        intent: "CREATE_RUN_SET",
        ...runSet,
      };
    }
    case "UPDATE_RUN_SET": {
      if (typeof name !== "string") {
        throw new Error("Run set name is required and must be a string.");
      }
      const runSetToUpdate = await RunSetService.findOne({
        _id: entityId,
        project: params.id,
      });
      if (!runSetToUpdate) {
        return data(
          { errors: { runSet: "Run set not found" } },
          { status: 404 },
        );
      }
      await RunSetService.updateById(entityId, {
        name,
      });
      return {};
    }
    case "DUPLICATE_RUN_SET": {
      if (typeof name !== "string") {
        throw new Error("Run set name is required and must be a string.");
      }
      const existingRunSet = await RunSetService.findOne({
        _id: entityId,
        project: params.id,
      });

      if (!existingRunSet) {
        throw new Error("Run set not found");
      }

      runSet = await RunSetService.create({
        project: existingRunSet.project,
        name: name,
        sessions: existingRunSet.sessions,
        runs: existingRunSet.runs || [],
        hasSetup: true,
        annotationType: existingRunSet.annotationType,
      });
      return {
        intent: "DUPLICATE_RUN_SET",
        ...runSet,
      };
    }
    case "DELETE_RUN_SET": {
      const runSetToDelete = await RunSetService.findOne({
        _id: entityId,
        project: params.id,
      });
      if (!runSetToDelete) {
        return data(
          { errors: { runSet: "Run set not found" } },
          { status: 404 },
        );
      }
      await RunSetService.deleteWithCleanup(entityId);

      return {
        intent: "DELETE_RUN_SET",
      };
    }
    default: {
      return {};
    }
  }
}

export default function RunSetsListRoute({ loaderData }: Route.ComponentProps) {
  const { runSets, project } = loaderData;
  const navigate = useNavigate();

  const {
    openEditRunSetDialog,
    openDeleteRunSetDialog,
    openDuplicateRunSetDialog,
  } = useRunSetActions({
    projectId: project._id,
  });

  const {
    searchValue,
    setSearchValue,
    currentPage,
    setCurrentPage,
    sortValue,
    setSortValue,
    isSyncing,
  } = useSearchQueryParams({
    searchValue: "",
    currentPage: 1,
    sortValue: "createdAt",
  });

  const onSearchValueChanged = (searchValue: string) => {
    setSearchValue(searchValue);
  };

  const onPaginationChanged = (currentPage: number) => {
    setCurrentPage(currentPage);
  };

  const onSortValueChanged = (sortValue: string) => {
    setSortValue(sortValue);
  };

  const onCreateRunSetButtonClicked = () => {
    navigate(`/projects/${project._id}/create-run-set`);
  };

  const onUseAsTemplateButtonClicked = (runSet: RunSet) => {
    navigate(
      `/projects/${project._id}/create-run-set?fromRunSet=${runSet._id}`,
    );
  };

  return (
    <RunSetsList
      runSets={runSets?.data}
      totalPages={runSets.totalPages}
      searchValue={searchValue}
      currentPage={currentPage}
      sortValue={sortValue}
      isSyncing={isSyncing}
      onCreateRunSetButtonClicked={onCreateRunSetButtonClicked}
      onEditRunSetButtonClicked={openEditRunSetDialog}
      onDuplicateRunSetButtonClicked={openDuplicateRunSetDialog}
      onUseAsTemplateButtonClicked={onUseAsTemplateButtonClicked}
      onDeleteRunSetButtonClicked={openDeleteRunSetDialog}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
      onSortValueChanged={onSortValueChanged}
    />
  );
}
