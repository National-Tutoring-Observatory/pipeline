import getDocument from "~/core/documents/getDocument";
import PromptEditor from "../components/promptEditor";
import type { Route } from "./+types/promptEditor.route";
import type { PromptVersion } from "../prompts.types";
import { useLoaderData, useNavigation, useSubmit } from "react-router";
import updateDocument from "~/core/documents/updateDocument";

export async function loader({ params }: Route.LoaderArgs) {

  const promptVersion = await getDocument({ collection: 'promptVersions', match: { version: parseInt(params.version), prompt: parseInt(params.id) } }) as { data: PromptVersion };

  return { promptVersion };
}

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { name, userPrompt } = payload;

  switch (intent) {
    case 'UPDATE_PROMPT_VERSION':
      const promptVersion = await updateDocument({
        collection: 'promptVersions',
        match: { _id: Number(entityId) },
        update: { name, userPrompt }
      }) as { data: PromptVersion }
      return {};
    default:
      return {};
  }
}

export default function PromptEditorRoute() {

  const data = useLoaderData();
  const navigation = useNavigation();
  const submit = useSubmit();

  const { promptVersion } = data;

  const onSavePromptVersion = ({ name, userPrompt, _id }: { name: string, userPrompt: string, _id: string }) => {
    submit(JSON.stringify({ intent: 'UPDATE_PROMPT_VERSION', entityId: _id, payload: { name, userPrompt } }), { method: 'PUT', encType: 'application/json' });
  }

  return (
    <PromptEditor
      promptVersion={promptVersion.data}
      isLoading={navigation.state === 'loading'}
      onSavePromptVersion={onSavePromptVersion}
    />
  )
}