import { useActionData, useLoaderData, useNavigate, useParams, useSubmit } from "react-router";
import Prompt from '../components/prompt';
import type { Route } from "./+types/prompt.route";
import type { Prompt as PromptType, PromptVersion } from "../prompts.types";
import pick from 'lodash/pick';
import { useEffect } from "react";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";

export async function loader({ params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const prompt = await documents.getDocument({ collection: 'prompts', match: { _id: params.id } }) as { data: PromptType };
  const promptVersions = await documents.getDocuments({
    collection: 'promptVersions',
    match: { prompt: params.id },
    sort: { version: -1 },
  }) as { data: PromptVersion[] };
  return { prompt, promptVersions };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { version } = payload;

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'CREATE_PROMPT_VERSION':
      const previousPromptVerion = await documents.getDocument({ collection: 'promptVersions', match: { prompt: entityId, version: Number(version) } }) as { data: PromptVersion };
      const newPromptAttributes = pick(previousPromptVerion.data, ['userPrompt', 'annotationSchema']);
      const promptVerions = await documents.getDocuments({ collection: 'promptVersions', match: { prompt: entityId }, sort: {} }) as { count: number };
      const promptVersion = await documents.createDocument({ collection: 'promptVersions', update: { ...newPromptAttributes, name: `${previousPromptVerion.data.name.replace(/#\d+/g, '').trim()} #${promptVerions.count + 1}`, prompt: entityId, version: promptVerions.count + 1 } }) as { data: PromptVersion }
      return {
        intent: 'CREATE_PROMPT_VERSION',
        ...promptVersion
      }
    default:
      return {};
  }
}

export default function PromptRoute() {

  const data = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();

  const { id, version } = useParams();

  const submit = useSubmit();

  const { prompt, promptVersions } = data;

  const onCreatePromptVersionClicked = () => {
    submit(JSON.stringify({ intent: 'CREATE_PROMPT_VERSION', entityId: id, payload: { version } }), { method: 'POST', encType: 'application/json' });
  }

  useEffect(() => {
    if (actionData?.intent === 'CREATE_PROMPT_VERSION') {
      navigate(`/prompts/${actionData.data.prompt}/${actionData.data.version}`)
    }
  }, [actionData]);

  useEffect(() => {
    updateBreadcrumb([{
      text: 'Prompts', link: '/prompts'
    }, {
      text: prompt.data.name
    }]);
  }, []);

  return (
    <Prompt
      prompt={prompt.data}
      promptVersions={promptVersions.data}
      version={Number(version)}
      onCreatePromptVersionClicked={onCreatePromptVersionClicked}
    />
  );
}