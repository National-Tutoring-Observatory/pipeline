import find from 'lodash/find';
import { useEffect } from "react";
import { redirect, useActionData, useLoaderData, useNavigate, useParams, useRevalidator, useSubmit } from "react-router";
import { toast } from "sonner";
import buildQueryFromParams from '~/modules/app/helpers/buildQueryFromParams';
import getQueryParamsFromRequest from '~/modules/app/helpers/getQueryParamsFromRequest.server';
import useHandleSockets from "~/modules/app/hooks/useHandleSockets";
import { useSearchQueryParams } from '~/modules/app/hooks/useSearchQueryParams';
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import type { DocumentAdapter } from "~/modules/documents/documents.types";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import ProjectAuthorization from "~/modules/projects/authorization";
import type { Project } from "~/modules/projects/projects.types";
import type { Run } from "~/modules/runs/runs.types";
import DuplicateRunDialog from '../components/duplicateRunDialog';
import EditRunDialog from "../components/editRunDialog";
import ProjectRuns from "../components/projectRuns";
import type { Route } from "./+types/projectRuns.route";

export async function loader({ request, params }: Route.LoaderArgs) {
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
    filterableFields: ['annotationType']
  });

  const documents = getDocumentsAdapter();
  const result = await documents.getDocuments<Run>({ collection: 'runs', populate: [{ path: 'prompt' }], ...query });
  return { runs: result };
}

async function getExistingRun(documents: DocumentAdapter, runId: string): Promise<Run> {
  const existingRun = await documents.getDocument<Run>({
    collection: 'runs',
    match: {
      _id: runId,
    }
  });

  if (!existingRun.data) {
    throw new Error("Run not found.");
  }

  return existingRun.data;
}

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json();

  const user = await getSessionUser({ request });
  if (!user) {
    return redirect('/');
  }

  const { name } = payload;
  let run;

  const documents = getDocumentsAdapter();

  const project = await documents.getDocument<Project>({
    collection: 'projects',
    match: { _id: params.id },
  });
  if (!project.data) {
    throw new Error('Project not found');
  }
  const teamId = (project.data.team as any)._id || project.data.team;

  switch (intent) {
    case 'UPDATE_RUN': {
      if (typeof name !== "string") {
        throw new Error("Run name is required and must be a string.");
      }

      if (!ProjectAuthorization.Runs.canManage(user, project.data)) {
        throw new Error('You do not have permission to update runs in this project.');
      }

      const existingRun = await getExistingRun(documents, entityId);

      await documents.updateDocument<Run>({
        collection: 'runs',
        match: {
          _id: entityId,
        },
        update: {
          name
        }
      });
      return {};
    }
    case 'DUPLICATE_RUN': {

      if (typeof name !== "string") {
        throw new Error("Run name is required and must be a string.");
      }

      if (!ProjectAuthorization.Runs.canManage(user, project.data)) {
        throw new Error('You do not have permission to duplicate runs in this project.');
      }

      const existingRun = await getExistingRun(documents, entityId);

      const { project: projectId, annotationType, prompt, promptVersion, model, snapshot, sessions } = existingRun;

      run = await documents.createDocument<Run>({
        collection: 'runs',
        update: {
          project: projectId,
          name: name,
          annotationType,
          prompt,
          promptVersion,
          model,
          sessions,
          hasSetup: false,
          isRunning: false,
          isComplete: false,
          snapshot: snapshot,
        }
      });
      return {
        intent: 'DUPLICATE_RUN',
        ...run
      };
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
    if (actionData?.intent === 'DUPLICATE_RUN') {
      navigate(`/projects/${actionData.data.project}/runs/${actionData.data._id}`)
    }
  }, [actionData]);

  const onEditRunClicked = (run: Run) => {
    submit(JSON.stringify({ intent: 'UPDATE_RUN', entityId: run._id, payload: { name: run.name } }), { method: 'PUT', encType: 'application/json' }).then(() => {
      toast.success('Updated run');
    });
  }

  const onDuplicateNewRunClicked = ({ name, runId }: { name: string, runId: string }) => {
    submit(JSON.stringify({ intent: 'DUPLICATE_RUN', entityId: runId, payload: { name: name } }), { method: 'POST', encType: 'application/json' }).then(() => {
      toast.success('Duplicated run');
    });
  }

  const onEditRunButtonClicked = (run: Run) => {
    addDialog(<EditRunDialog
      run={run}
      onEditRunClicked={onEditRunClicked}
    />);
  }

  const onCreateRunButtonClicked = () => {
    navigate(`/projects/${projectId}/create-run`);
  }

  const onDuplicateRunButtonClicked = (run: Run) => {
    addDialog(<DuplicateRunDialog
      run={run}
      onDuplicateNewRunClicked={onDuplicateNewRunClicked}
    />
    );
  }

  const onActionClicked = (action: string) => {
    if (action === 'CREATE') {
      onCreateRunButtonClicked();
    }
  }

  const onItemActionClicked = ({ id, action }: { id: string, action: string }) => {
    const run = find(runs.data, { _id: id });
    if (!run) return null;
    switch (action) {
      case 'EDIT':
        onEditRunButtonClicked(run);
        break;
      case 'DUPLICATE':
        onDuplicateRunButtonClicked(run);
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

  useHandleSockets({
    event: 'ANNOTATE_RUN',
    matches: [{
      task: 'ANNOTATE_RUN:START',
      status: 'FINISHED'
    }, {
      task: 'ANNOTATE_RUN:FINISH',
      status: 'FINISHED'
    }], callback: (payload) => {
      revalidate();
    }
  })

  return (
    <ProjectRuns
      runs={runs.data}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={runs.totalPages}
      filtersValues={filtersValues}
      sortValue={sortValue}
      onActionClicked={onActionClicked}
      onItemActionClicked={onItemActionClicked}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
      onFiltersValueChanged={onFiltersValueChanged}
      onSortValueChanged={onSortValueChanged}
    />
  )
}
