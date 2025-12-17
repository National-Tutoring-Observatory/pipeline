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

      const prompt = await documents.createDocument<Prompt>({ collection: 'prompts', update: { name, annotationType, team, productionVersion: 1 } });
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
      const updateTeamId = (promptDoc.data.team as any)._id || promptDoc.data.team;
      if (!PromptAuthorization.canUpdate(user, updateTeamId)) {
        throw new Error("You do not have permission to update this prompt.");
      }
      return await documents.updateDocument({ collection: 'prompts', match: { _id: entityId }, update: { name } });
    case 'DELETE_PROMPT':
      const deletePromptDoc = await documents.getDocument<Prompt>({ collection: 'prompts', match: { _id: entityId } });
      if (!deletePromptDoc.data) throw new Error('Prompt not found');
      const deleteTeamId = (deletePromptDoc.data.team as any)._id || deletePromptDoc.data.team;
      if (!PromptAuthorization.canDelete(user, deleteTeamId)) {
        throw new Error("You do not have permission to delete this prompt.");
      }
      return await documents.deleteDocument({ collection: 'prompts', match: { _id: entityId } })
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
    filtersValues, setFiltersValues
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

  const onCreatePromptButtonClicked = () => {
    addDialog(
      <CreatePromptDialog
        hasTeamSelection={true}
        onCreateNewPromptClicked={onCreateNewPromptClicked}
      />
    );
  }

  const onEditPromptButtonClicked = (prompt: Prompt) => {
    addDialog(<EditPromptDialog
      prompt={prompt}
      onEditPromptClicked={onEditPromptClicked}
    />);
  }

  const onDeletePromptButtonClicked = (prompt: Prompt) => {
    addDialog(
      <DeletePromptDialog
        prompt={prompt}
        onDeletePromptClicked={onDeletePromptClicked}
      />
    );
  }

  const onCreateNewPromptClicked = ({ name, annotationType, team }: { name: string, annotationType: string, team: string | null }) => {
    submit(JSON.stringify({ intent: 'CREATE_PROMPT', payload: { name, annotationType, team } }), { method: 'POST', encType: 'application/json' });
  }

  const onEditPromptClicked = (prompt: Prompt) => {
    submit(JSON.stringify({ intent: 'UPDATE_PROMPT', entityId: prompt._id, payload: { name: prompt.name } }), { method: 'PUT', encType: 'application/json' }).then(() => {
      toast.success('Updated prompt');
    });
  }

  const onDeletePromptClicked = (promptId: string) => {
    submit(JSON.stringify({ intent: 'DELETE_PROMPT', entityId: promptId }), { method: 'DELETE', encType: 'application/json' }).then(() => {
      toast.success('Deleted prompt');
    });
  }

  const onActionClicked = (action: String) => {
    if (action === 'CREATE') {
      onCreatePromptButtonClicked();
    }
  }

  const onItemActionClicked = ({ id, action }: { id: string, action: string }) => {
    const prompt = find(prompts.data, { _id: id });
    if (!prompt) return null;
    switch (action) {
      case 'EDIT':
        onEditPromptButtonClicked(prompt);
        break;

      case 'DELETE':
        onDeletePromptButtonClicked(prompt);
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
      onActionClicked={onActionClicked}
      onItemActionClicked={onItemActionClicked}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
      onFiltersValueChanged={onFiltersValueChanged}
      onSortValueChanged={onSortValueChanged}
      onCreatePromptButtonClicked={onCreatePromptButtonClicked}
      onEditPromptButtonClicked={onEditPromptButtonClicked}
      onDeletePromptButtonClicked={onDeletePromptButtonClicked}
    />
  );
}
