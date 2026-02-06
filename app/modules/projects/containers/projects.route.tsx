import escapeRegExp from "lodash/escapeRegExp";
import find from "lodash/find";
import map from "lodash/map";
import { data, redirect, useNavigate, useRevalidator } from "react-router";
import { toast } from "sonner";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import useHandleSockets from "~/modules/app/hooks/useHandleSockets";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import addDialog from "~/modules/dialogs/addDialog";
import type { User } from "~/modules/users/users.types";
import ProjectAuthorization from "../authorization";
import CreateProjectDialog from "../components/createProjectDialog";
import Projects from "../components/projects";
import { useProjectActions } from "../hooks/useProjectActions";
import { ProjectService } from "../project";
import deleteProject from "../services/deleteProject.server";
import type { Route } from "./+types/projects.route";

export async function loader({
  request,
  params,
  context,
}: Route.LoaderArgs & { context: any }) {
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, "team");

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
    sort: "name",
    filters: {},
  });

  const query = buildQueryFromParams({
    match: { team: { $in: teamIds } },
    queryParams,
    searchableFields: ["name"],
    sortableFields: ["name", "createdAt"],
  });

  const projects = await ProjectService.paginate(query);

  return {
    projects,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const user = (await getSessionUser({ request })) as User;

  if (!user) {
    return redirect("/");
  }

  const { intent, entityId, payload = {} } = await request.json();
  const { name, team } = payload;

  switch (intent) {
    case "CREATE_PROJECT": {
      if (typeof name !== "string" || !name.trim()) {
        return data(
          { errors: { general: "Project name is required" } },
          { status: 400 },
        );
      }

      if (!ProjectAuthorization.canCreate(user, team)) {
        return data(
          {
            errors: {
              general:
                "You do not have permission to create projects in this team",
            },
          },
          { status: 403 },
        );
      }

      const existingProject = await ProjectService.findOne({
        name: { $regex: new RegExp(`^${escapeRegExp(name.trim())}$`, "i") },
        team,
      });

      if (existingProject) {
        return data(
          { errors: { general: "A project with this name already exists" } },
          { status: 409 },
        );
      }

      const project = await ProjectService.create({
        name: name.trim(),
        team,
        createdBy: user._id,
      });

      return data({ success: true, intent: "CREATE_PROJECT", data: project });
    }

    case "UPDATE_PROJECT": {
      if (typeof name !== "string" || !name.trim()) {
        return data(
          { errors: { general: "Project name is required" } },
          { status: 400 },
        );
      }

      const project = await ProjectService.findById(entityId);
      if (!project) {
        return data(
          { errors: { general: "Project not found" } },
          { status: 404 },
        );
      }

      if (!ProjectAuthorization.canUpdate(user, project)) {
        return data(
          {
            errors: {
              general: "You do not have permission to update this project",
            },
          },
          { status: 403 },
        );
      }

      const existingProject = await ProjectService.findOne({
        name: { $regex: new RegExp(`^${escapeRegExp(name.trim())}$`, "i") },
        team: project.team,
        _id: { $ne: entityId },
      });

      if (existingProject) {
        return data(
          { errors: { general: "A project with this name already exists" } },
          { status: 409 },
        );
      }

      const updated = await ProjectService.updateById(entityId, {
        name: name.trim(),
      });
      return data({ success: true, intent: "UPDATE_PROJECT", data: updated });
    }

    case "DELETE_PROJECT": {
      const project = await ProjectService.findById(entityId);
      if (!project) {
        return data(
          { errors: { general: "Project not found" } },
          { status: 404 },
        );
      }

      if (!ProjectAuthorization.canDelete(user, project)) {
        return data(
          {
            errors: {
              general: "You do not have permission to delete this project",
            },
          },
          { status: 403 },
        );
      }

      await deleteProject({ projectId: entityId });
      return data({ success: true, intent: "DELETE_PROJECT" });
    }

    default:
      return data({ errors: { general: "Invalid intent" } }, { status: 400 });
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function ProjectsRoute({ loaderData }: Route.ComponentProps) {
  const { projects } = loaderData;
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();

  const { openEditProjectDialog, openDeleteProjectDialog } = useProjectActions({
    onDeleteSuccess: revalidate,
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

  useHandleSockets({
    event: "DELETE_PROJECT",
    matches: [{ status: "FINISHED" }],
    callback: revalidate,
  });

  const breadcrumbs = [{ text: "Projects" }];

  const openCreateProjectDialog = () => {
    addDialog(
      <CreateProjectDialog
        hasTeamSelection={true}
        onProjectCreated={(project) => {
          toast.success("Project created");
          navigate(`/projects/${project._id}`);
        }}
      />,
    );
  };

  const onActionClicked = (action: String) => {
    if (action === "CREATE") {
      openCreateProjectDialog();
    }
  };

  const onItemActionClicked = ({
    id,
    action,
  }: {
    id: string;
    action: string;
  }) => {
    const project = find(projects.data, { _id: id });
    if (!project) return null;
    switch (action) {
      case "EDIT":
        openEditProjectDialog(project);
        break;

      case "DELETE":
        openDeleteProjectDialog(project);
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

  return (
    <Projects
      projects={projects?.data}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={projects.totalPages}
      filtersValues={filtersValues}
      sortValue={sortValue}
      breadcrumbs={breadcrumbs}
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
