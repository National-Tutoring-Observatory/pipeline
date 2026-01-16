import find from 'lodash/find';
import map from 'lodash/map';
import { useEffect } from "react";
import { redirect, useNavigate, useRevalidator, useFetcher, data } from "react-router";
import { toast } from "sonner";
import buildQueryFromParams from '~/modules/app/helpers/buildQueryFromParams';
import getQueryParamsFromRequest from '~/modules/app/helpers/getQueryParamsFromRequest.server';
import useHandleSockets from '~/modules/app/hooks/useHandleSockets';
import { useSearchQueryParams } from '~/modules/app/hooks/useSearchQueryParams';
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import addDialog from "~/modules/dialogs/addDialog";
import { getPaginationParams, getTotalPages } from '~/helpers/pagination';
import type { User } from "~/modules/users/users.types";
import ProjectAuthorization from "../authorization";
import CreateProjectDialog from "../components/createProjectDialog";
import DeleteProjectDialog from "../components/deleteProjectDialog";
import EditProjectDialog from "../components/editProjectDialog";
import Projects from "../components/projects";
import type { Project } from "../projects.types";
import { ProjectService } from "../project";
import deleteProject from "../services/deleteProject.server";
import type { Route } from "./+types/projects.route";



export async function loader({ request, params, context }: Route.LoaderArgs & { context: any }) {
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, 'team');

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: '',
    currentPage: 1,
    sort: 'name',
    filters: {}
  });

  const query = buildQueryFromParams({
    match: { team: { $in: teamIds } },
    queryParams,
    searchableFields: ['name'],
    sortableFields: ['name', 'createdAt']
  });

  const projects = await ProjectService.paginate(query)

  return {
    projects
  };
}

export async function action({
  request,
}: Route.ActionArgs) {
  const user = await getSessionUser({ request }) as User;

  if (!user) {
    return redirect('/');
  }

  const { intent, entityId, payload = {} } = await request.json();
  const { name, team } = payload;

  switch (intent) {
    case 'CREATE_PROJECT': {
      if (typeof name !== 'string' || !name.trim()) {
        return data(
          { errors: { general: 'Project name is required' } },
          { status: 400 }
        );
      }

      if (!ProjectAuthorization.canCreate(user, team)) {
        return data(
          { errors: { general: 'You do not have permission to create projects in this team' } },
          { status: 403 }
        );
      }

      const project = await ProjectService.create({
        name: name.trim(),
        team,
        createdBy: user._id
      });

      return data({ success: true, intent: 'CREATE_PROJECT', data: project });
    }

    case 'UPDATE_PROJECT': {
      if (typeof name !== 'string' || !name.trim()) {
        return data(
          { errors: { general: 'Project name is required' } },
          { status: 400 }
        );
      }

      const project = await ProjectService.findById(entityId);
      if (!project) {
        return data(
          { errors: { general: 'Project not found' } },
          { status: 404 }
        );
      }

      if (!ProjectAuthorization.canUpdate(user, project)) {
        return data(
          { errors: { general: 'You do not have permission to update this project' } },
          { status: 403 }
        );
      }

      const updated = await ProjectService.updateById(entityId, { name: name.trim() });
      return data({ success: true, intent: 'UPDATE_PROJECT', data: updated });
    }

    case 'DELETE_PROJECT': {
      const project = await ProjectService.findById(entityId);
      if (!project) {
        return data(
          { errors: { general: 'Project not found' } },
          { status: 404 }
        );
      }

      if (!ProjectAuthorization.canDelete(user, project)) {
        return data(
          { errors: { general: 'You do not have permission to delete this project' } },
          { status: 403 }
        );
      }

      await deleteProject({ projectId: entityId });
      return data({ success: true, intent: 'DELETE_PROJECT' });
    }

    default:
      return data(
        { errors: { general: 'Invalid intent' } },
        { status: 400 }
      );
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}


export default function ProjectsRoute({ loaderData }: Route.ComponentProps) {
  const { projects } = loaderData;
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();

  const {
    searchValue, setSearchValue,
    currentPage, setCurrentPage,
    sortValue, setSortValue,
    filtersValues, setFiltersValues,
    isSyncing
  } = useSearchQueryParams({
    searchValue: '',
    currentPage: 1,
    sortValue: 'name',
    filters: {}
  });

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.success && fetcher.data.intent === 'CREATE_PROJECT') {
        toast.success('Project created');
        addDialog(null);
        navigate(`/projects/${fetcher.data.data._id}`);
      } else if (fetcher.data.success && fetcher.data.intent === 'UPDATE_PROJECT') {
        toast.success('Project updated');
        addDialog(null);
      } else if (fetcher.data.success && fetcher.data.intent === 'DELETE_PROJECT') {
        toast.success('Project deleted');
        addDialog(null);
        revalidate();
      } else if (fetcher.data.errors) {
        toast.error(fetcher.data.errors.general || 'An error occurred');
      }
    }
  }, [fetcher.state, fetcher.data, navigate, revalidate]);

  useHandleSockets({
    event: 'DELETE_PROJECT',
    matches: [{ status: 'FINISHED' }],
    callback: revalidate
  });

  useEffect(() => {
    updateBreadcrumb([{ text: 'Projects' }])
  }, []);

  const openCreateProjectDialog = () => {
    addDialog(
      <CreateProjectDialog
        hasTeamSelection={true}
        onCreateNewProjectClicked={submitCreateProject}
        isSubmitting={fetcher.state === 'submitting'}
      />
    );
  }

  const openEditProjectDialog = (project: Project) => {
    addDialog(<EditProjectDialog
      project={project}
      onEditProjectClicked={submitEditProject}
      isSubmitting={fetcher.state === 'submitting'}
    />);
  }

  const openDeleteProjectDialog = (project: Project) => {
    addDialog(
      <DeleteProjectDialog
        project={project}
        onDeleteProjectClicked={submitDeleteProject}
        isSubmitting={fetcher.state === 'submitting'}
      />
    );
  }

  const submitCreateProject = ({ name, team }: {
    name: string, team: string | null
  }) => {
    fetcher.submit(
      JSON.stringify({ intent: 'CREATE_PROJECT', payload: { name, team } }),
      { method: 'POST', encType: 'application/json' }
    );
  }

  const submitEditProject = (project: Project) => {
    fetcher.submit(
      JSON.stringify({ intent: 'UPDATE_PROJECT', entityId: project._id, payload: { name: project.name } }),
      { method: 'PUT', encType: 'application/json' }
    );
  }

  const submitDeleteProject = (projectId: string) => {
    fetcher.submit(
      JSON.stringify({ intent: 'DELETE_PROJECT', entityId: projectId }),
      { method: 'DELETE', encType: 'application/json' }
    );
  }

  const onActionClicked = (action: String) => {
    if (action === 'CREATE') {
      openCreateProjectDialog();
    }
  }

  const onItemActionClicked = ({ id, action }: { id: string, action: string }) => {
    const project = find(projects.data, { _id: id });
    if (!project) return null;
    switch (action) {
      case 'EDIT':
        openEditProjectDialog(project);
        break;

      case 'DELETE':
        openDeleteProjectDialog(project);
        break;
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
    <Projects
      projects={projects?.data}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={projects.totalPages}
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
