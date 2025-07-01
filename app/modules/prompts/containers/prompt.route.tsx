import { useLoaderData, useParams, useSubmit } from "react-router";
import Prompt from '../components/prompt';
import getDocument from "~/core/documents/getDocument";
import type { Route } from "./+types/prompt.route";
import type { Prompt as PromptType, PromptVersion } from "../prompts.types";
import getDocuments from "~/core/documents/getDocuments";
import createDocument from "~/core/documents/createDocument";

export async function loader({ params }: Route.LoaderArgs) {
  const prompt = await getDocument({ collection: 'prompts', match: { _id: parseInt(params.id) } }) as { data: PromptType };
  const promptVersions = await getDocuments({
    collection: 'promptVersions',
    match: { prompt: parseInt(params.id) },
    sort: { version: -1 },
  }) as { data: PromptVersion[] };
  return { prompt, promptVersions };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { name, annotationType } = payload;

  switch (intent) {
    case 'CREATE_PROMPT_VERSION':
      const promptVerions = await getDocuments({ collection: 'promptVersions', match: { prompt: Number(entityId) } }) as { count: number };
      const promptVersion = await createDocument({ collection: 'promptVersions', update: { name: 'initial', prompt: Number(entityId), version: promptVerions.count + 1 } }) as { data: PromptVersion }
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

  const { id, version } = useParams();

  const submit = useSubmit();

  const { prompt, promptVersions } = data;

  const onCreatePromptVersionClicked = () => {
    submit(JSON.stringify({ intent: 'CREATE_PROMPT_VERSION', entityId: id, payload: {} }), { method: 'POST', encType: 'application/json' });
  }

  return (
    <Prompt
      prompt={prompt.data}
      promptVersions={promptVersions.data}
      version={Number(version)}
      onCreatePromptVersionClicked={onCreatePromptVersionClicked}
    />
  );
}