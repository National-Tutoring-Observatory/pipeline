import { useEffect } from "react";
import { redirect, useActionData, useLoaderData, useNavigate, useOutletContext, useParams, useSubmit } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
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
  if (!PromptAuthorization.canView(user, params.id)) {
    return redirect('/');
  }
  const documents = getDocumentsAdapter();
  const promptsResult = await documents.getDocuments<Prompt>({ collection: 'prompts', match: { team: params.id } });
  return { prompts: promptsResult.data };
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

    const prompt = await documents.createDocument<Prompt>({ collection: 'prompts', update: { name, annotationType, team: params.id, productionVersion: 1 } });
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
  const prompts = data.prompts ?? [];

  return (
    <TeamPrompts
      prompts={prompts}
      team={ctx.team}
      onCreatePromptButtonClicked={onCreatePromptButtonClicked}
    />
  );
}
