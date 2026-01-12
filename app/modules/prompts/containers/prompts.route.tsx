import find from 'lodash/find';
import map from 'lodash/map';
import { useEffect } from "react";
import { redirect, useActionData, useNavigate, useSubmit } from "react-router";
import { toast } from "sonner";
import buildQueryFromParams from '~/modules/app/helpers/buildQueryFromParams';
import getQueryParamsFromRequest from '~/modules/app/helpers/getQueryParamsFromRequest.server';
import { useSearchQueryParams } from '~/modules/app/hooks/useSearchQueryParams';
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import PromptAuthorization from "~/modules/prompts/authorization";
import type { User } from "~/modules/users/users.types";
import CreatePromptDialog from "../components/createPromptDialog";
import DeletePromptDialog from "../components/deletePromptDialog";
import EditPromptDialog from "../components/editPromptDialog";
import Prompts from "../components/prompts";
import type { Prompt, PromptVersion } from "../prompts.types";
import type { Route } from "./+types/prompts.route";

export async function loader({ request }: Route.LoaderArgs) {
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
    match: {
      team: { $in: teamIds },
      deletedAt: { $exists: false }
    },
    queryParams,
    searchableFields: ['name'],
    sortableFields: ['name', 'createdAt'],
    filterableFields: ['annotationType']
  });

  const result = await documents.getDocuments<Prompt>({ collection: 'prompts', populate: [{ path: 'team' }], ...query });

  return { prompts: result };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { name, annotationType, team } = payload;

  const user = await getSessionUser({ request }) as User;

  if (!user) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'CREATE_PROMPT':
      if (typeof name !== "string") {
        throw new Error("Prompt name is required and must be a string.");
      }

      if (!PromptAuthorization.canCreate(user, team)) {
        throw new Error("You do not have permission to create prompts in this team.");
      }

      const prompt = await documents.createDocument<Prompt>({ collection: 'prompts', update: { name, annotationType, team, productionVersion: 1, createdBy: user._id } });
      await documents.createDocument<PromptVersion>({
        collection: 'promptVersions',
        update: {
          name: 'initial',
          prompt: prompt.data._id, version: 1,
          annotationSchema: [{
            "isSystem": true,
            "fieldKey": "_id",
            "fieldType": "string",
            "value": ""
          }, {
            "isSystem": true,
            "fieldKey": "identifiedBy",
            "fieldType": "string",
            "value": "AI"
          }]
        }
      });
      return {
        intent: 'CREATE_PROMPT',
        ...prompt
      }
    case 'UPDATE_PROMPT':
      const promptDoc = await documents.getDocument<Prompt>({ collection: 'prompts', match: { _id: entityId } });
      if (!promptDoc.data) throw new Error('Prompt not found');
      if (!PromptAuthorization.canUpdate(user, promptDoc.data)) {
        throw new Error("You do not have permission to update this prompt.");
      }
      return await documents.updateDocument({ collection: 'prompts', match: { _id: entityId }, update: { name } });
    case 'DELETE_PROMPT': {
      const deletePromptDoc = await documents.getDocument<Prompt>({ collection: 'prompts', match: { _id: entityId } });
      if (!deletePromptDoc.data) throw new Error('Prompt not found');
      if (!PromptAuthorization.canDelete(user, deletePromptDoc.data)) {
        throw new Error("You do not have permission to delete this prompt.");
      }

      const runsUsingPromptCount = await documents.countDocuments({
        collection: 'runs',
        match: {
          prompt: entityId,
          hasSetup: true,        // Only active/configured runs
          isComplete: false      // Exclude finished runs (data preserved in snapshot)
        }
      });

      if (runsUsingPromptCount > 0) {
        throw new Error(
          `Cannot delete prompt: ${runsUsingPromptCount} active run(s) reference it. ` +
          `Wait for runs to complete or create a new prompt for future runs.`
        );
      }

      // Soft delete - hide the prompt
      await documents.updateDocument({ collection: 'prompts', match: { _id: entityId }, update: { deletedAt: new Date() } });

      return { intent: 'DELETE_PROMPT', status: 'deleted' };
    }
    default:
      return {};
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}


export default function PromptsRoute({ loaderData }: Route.ComponentProps) {
  const { prompts } = loaderData;
  const submit = useSubmit();
  const actionData = useActionData();
  const navigate = useNavigate();

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
    if (actionData?.intent === 'CREATE_PROMPT') {
      navigate(`/prompts/${actionData.data._id}/${actionData.data.productionVersion}`)
    }
  }, [actionData]);

  useEffect(() => {
    updateBreadcrumb([{ text: 'Prompts' }])
  }, []);

  const openCreatePromptDialog = () => {
    addDialog(
      <CreatePromptDialog
        hasTeamSelection={true}
        onCreateNewPromptClicked={submitCreatePrompt}
      />
    );
  }

  const openEditPromptDialog = (prompt: Prompt) => {
    addDialog(<EditPromptDialog
      prompt={prompt}
      onEditPromptClicked={submitEditPrompt}
    />);
  }

  const openDeletePromptDialog = (prompt: Prompt) => {
    addDialog(
      <DeletePromptDialog
        prompt={prompt}
        onDeletePromptClicked={submitDeletePrompt}
      />
    );
  }

  const submitCreatePrompt = ({ name, annotationType, team }: { name: string, annotationType: string, team: string | null }) => {
    submit(JSON.stringify({ intent: 'CREATE_PROMPT', payload: { name, annotationType, team } }), { method: 'POST', encType: 'application/json' });
  }

  const submitEditPrompt = (prompt: Prompt) => {
    submit(JSON.stringify({ intent: 'UPDATE_PROMPT', entityId: prompt._id, payload: { name: prompt.name } }), { method: 'PUT', encType: 'application/json' }).then(() => {
      toast.success('Updated prompt');
    });
  }

  const submitDeletePrompt = (promptId: string) => {
    submit(JSON.stringify({ intent: 'DELETE_PROMPT', entityId: promptId }), { method: 'DELETE', encType: 'application/json' }).then(() => {
      toast.success('Deleted prompt');
    });
  }

  const onActionClicked = (action: String) => {
    if (action === 'CREATE') {
      openCreatePromptDialog();
    }
  }

  const onItemActionClicked = ({ id, action }: { id: string, action: string }) => {
    const prompt = find(prompts.data, { _id: id });
    if (!prompt) return null;
    switch (action) {
      case 'EDIT':
        openEditPromptDialog(prompt);
        break;

      case 'DELETE':
        openDeletePromptDialog(prompt);
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
    <Prompts
      prompts={prompts?.data}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={prompts.totalPages}
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
