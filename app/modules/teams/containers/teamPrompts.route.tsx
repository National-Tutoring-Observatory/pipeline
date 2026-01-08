import find from 'lodash/find';
import { useEffect } from "react";
import { redirect, useActionData, useLoaderData, useNavigate, useOutletContext, useParams, useSubmit } from "react-router";
import buildQueryFromParams from '~/modules/app/helpers/buildQueryFromParams';
import getQueryParamsFromRequest from '~/modules/app/helpers/getQueryParamsFromRequest.server';
import { useSearchQueryParams } from '~/modules/app/hooks/useSearchQueryParams';
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { userIsTeamMember } from "~/modules/authorization/helpers/teamMembership";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import PromptAuthorization from "~/modules/prompts/authorization";
import CreatePromptDialog from "~/modules/prompts/components/createPromptDialog";
import type { Prompt } from "~/modules/prompts/prompts.types";
import TeamPrompts from "../components/teamPrompts";
import type { Route } from "./+types/teamPrompts.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (!user) {
    return redirect('/');
  }
  if (!userIsTeamMember(user, params.id)) {
    return redirect('/');
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: '',
    currentPage: 1,
    sort: 'name',
    filters: {}
  });

  const query = buildQueryFromParams({
    match: { team: params.id, deletedAt: { $exists: false } },
    queryParams,
    searchableFields: ['name'],
    sortableFields: ['name', 'createdAt'],
    filterableFields: ['annotationType']
  });

  const documents = getDocumentsAdapter();
  const result = await documents.getDocuments<Prompt>({ collection: 'prompts', ...query });
  return { prompts: result };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { intent, payload = {} } = await request.json();
  const { name, annotationType } = payload;

  const user = await getSessionUser({ request });
  if (!user) return { redirect: '/' };

  if (!PromptAuthorization.canCreate(user, params.id)) {
    throw new Error('You do not have permission to create a prompt in this team.');
  }

  const documents = getDocumentsAdapter();

  if (intent === 'CREATE_PROMPT') {
    if (typeof name !== 'string') throw new Error('Prompt name is required and must be a string.');

    const prompt = await documents.createDocument<Prompt>({ collection: 'prompts', update: { name, annotationType, team: params.id, productionVersion: 1, createdBy: user._id } });
    await documents.createDocument({
      collection: 'promptVersions',
      update: {
        name: 'initial',
        prompt: prompt.data._id,
        version: 1,
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
    };
  }

  return {};
}

export default function TeamPromptsRoute() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();
  const ctx = useOutletContext<any>();
  const actionData = useActionData();
  const submit = useSubmit();
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
    updateBreadcrumb([
      { text: 'Teams', link: '/teams' },
      { text: ctx.team.name, link: `/teams/${params.id}` },
      { text: 'Prompts' }
    ]);
  }, [params.id]);

  useEffect(() => {
    if (actionData?.intent === 'CREATE_PROMPT') {
      navigate(`/prompts/${actionData.data._id}/${actionData.data.productionVersion}`);
    }
  }, [actionData]);

  const onCreatePromptButtonClicked = () => {
    addDialog(
      <CreatePromptDialog
        hasTeamSelection={false}
        onCreateNewPromptClicked={onCreateNewPromptClicked}
      />
    );
  }

  const onCreateNewPromptClicked = ({ name, annotationType }: { name: string, annotationType: string }) => {
    submit(JSON.stringify({ intent: 'CREATE_PROMPT', payload: { name, annotationType } }), { method: 'POST', encType: 'application/json' });
  }

  const onActionClicked = (action: string) => {
    if (action === 'CREATE') {
      onCreatePromptButtonClicked();
    }
  }

  const onItemActionClicked = ({ id, action }: { id: string, action: string }) => {
    const prompt = find(data.prompts.data, { _id: id });
    if (!prompt) return null;
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

  const prompts = data.prompts.data ?? [];

  return (
    <TeamPrompts
      prompts={prompts}
      team={ctx.team}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={data.prompts.totalPages}
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
