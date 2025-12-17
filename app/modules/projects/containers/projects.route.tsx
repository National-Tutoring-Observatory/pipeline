import find from 'lodash/find';
import map from 'lodash/map';
import { useEffect } from "react";
import { redirect, useActionData, useNavigate, useRevalidator, useSubmit } from "react-router";
import { toast } from "sonner";
import buildQueryFromParams from '~/modules/app/helpers/buildQueryFromParams';
import getQueryParamsFromRequest from '~/modules/app/helpers/getQueryParamsFromRequest.server';
import useHandleSockets from '~/modules/app/hooks/useHandleSockets';
import { useSearchQueryParams } from '~/modules/app/hooks/useSearchQueryParams';
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import ProjectAuthorization from "../authorization";
import CreateProjectDialog from "../components/createProjectDialog";
import DeleteProjectDialog from "../components/deleteProjectDialog";
import EditProjectDialog from "../components/editProjectDialog";
import Projects from "../components/projects";
import type { Project } from "../projects.types";
import deleteProject from "../services/deleteProject.server";
import type { Route } from "./+types/projects.route";



export async function loader({ request, params, context }: Route.LoaderArgs & { context: any }) {
  const documents = getDocumentsAdapter();
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

  const result = await documents.getDocuments<Project>({ collection: 'projects', populate: [{ path: 'team' }], ...query });

  return { projects: result };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json();

  const { name, team } = payload;

  const user = await getSessionUser({ request }) as User;

  if (!user) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'CREATE_PROJECT':
      if (typeof name !== "string") {
        throw new Error("Project name is required and must be a string.");
      }

      if (!ProjectAuthorization.canCreate(user, team)) {
        throw new Error("You do not have permission to create projects in this team.");
      }

      const project = await documents.createDocument<Project>({
        collection: 'projects',
        update: { name, team },
      });

      return {
        intent: 'CREATE_PROJECT',
        ...project,
      };

    case 'UPDATE_PROJECT': {
      const projectDoc = await documents.getDocument<Project>({ collection: 'projects', match: { _id: entityId } });
      if (!projectDoc.data) throw new Error('Project not found');

      const teamId = (projectDoc.data.team as any)._id || projectDoc.data.team;
      if (!ProjectAuthorization.canUpdate(user, teamId)) {
        throw new Error("You do not have permission to update this project.");
      }

      return await documents.updateDocument({
        collection: 'projects',
        match: { _id: entityId },
        update: { name },
      });
    }

    case 'DELETE_PROJECT': {
      const projectDoc = await documents.getDocument<Project>({ collection: 'projects', match: { _id: entityId } });
      if (!projectDoc.data) throw new Error('Project not found');

      const teamId = (projectDoc.data.team as any)._id || projectDoc.data.team;
      if (!ProjectAuthorization.canDelete(user, teamId)) {
        throw new Error("You do not have permission to delete this project.");
      }
      return await deleteProject({ projectId: entityId });
    }

    default:
      return {};
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}


export default function ProjectsRoute({ loaderData }: Route.ComponentProps) {
  const { projects } = loaderData;
  const submit = useSubmit();
  const actionData = useActionData();
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();

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

  useEffect(() => {
    if (actionData?.intent === 'CREATE_PROJECT') {
      navigate(`/projects/${actionData.data._id}`)
    }
  }, [actionData]);

  useHandleSockets({
    event: 'DELETE_PROJECT',
    matches: [{ status: 'FINISHED' }],
    callback: revalidate
  });

  useEffect(() => {
    updateBreadcrumb([{ text: 'Projects' }])
  }, []);

  const onCreateProjectButtonClicked = () => {
    addDialog(
      <CreateProjectDialog
        hasTeamSelection={true}
        onCreateNewProjectClicked={onCreateNewProjectClicked}
      />
    );
  }

  const onEditProjectButtonClicked = (project: Project) => {
    addDialog(<EditProjectDialog
      project={project}
      onEditProjectClicked={onEditProjectClicked}
    />);
  }

  const onDeleteProjectButtonClicked = (project: Project) => {
    addDialog(
      <DeleteProjectDialog
        project={project}
        onDeleteProjectClicked={onDeleteProjectClicked}
      />
    );
  }

  const onCreateNewProjectClicked = ({ name, team }: {
    name: string, team: string | null
  }) => {
    submit(JSON.stringify({ intent: 'CREATE_PROJECT', payload: { name, team } }), { method: 'POST', encType: 'application/json' });
  }

  const onEditProjectClicked = (project: Project) => {
    submit(JSON.stringify({ intent: 'UPDATE_PROJECT', entityId: project._id, payload: { name: project.name } }), { method: 'PUT', encType: 'application/json' }).then(() => {
      toast.success('Updated project');
    });
  }

  const onDeleteProjectClicked = (projectId: string) => {
    submit(JSON.stringify({ intent: 'DELETE_PROJECT', entityId: projectId }), { method: 'DELETE', encType: 'application/json' }).then(() => {
      toast.success('Deleted project');
    });
  }

  const onActionClicked = (action: String) => {
    if (action === 'CREATE') {
      onCreateProjectButtonClicked();
    }
  }

  const onItemActionClicked = ({ id, action }: { id: string, action: string }) => {
    const project = find(projects.data, { _id: id });
    if (!project) return null;
    switch (action) {
      case 'EDIT':
        onEditProjectButtonClicked(project);
        break;

      case 'DELETE':
        onDeleteProjectButtonClicked(project);
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
      onActionClicked={onActionClicked}
      onItemActionClicked={onItemActionClicked}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
      onFiltersValueChanged={onFiltersValueChanged}
      onSortValueChanged={onSortValueChanged}
    />
  );
}
