import getDocument from "~/core/documents/getDocument";
import PromptEditor from "../components/promptEditor";
import type { Route } from "./+types/promptEditor.route";
import type { Prompt, PromptVersion } from "../prompts.types";
import { useLoaderData, useNavigation, useSubmit } from "react-router";
import updateDocument from "~/core/documents/updateDocument";

export async function loader({ params }: Route.LoaderArgs) {

  const prompt = await getDocument({ collection: 'prompts', match: { _id: parseInt(params.id) } }) as { data: Prompt };
  const promptVersion = await getDocument({ collection: 'promptVersions', match: { version: parseInt(params.version), prompt: parseInt(params.id) } }) as { data: PromptVersion };

  return { prompt, promptVersion };
}

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { name, userPrompt, annotationSchema, promptId } = payload;

  switch (intent) {
    case 'UPDATE_PROMPT_VERSION':
      await updateDocument({
        collection: 'promptVersions',
        match: { _id: Number(entityId) },
        update: { name, userPrompt, annotationSchema }
      }) as { data: PromptVersion }
      return {};
    case 'MAKE_PROMPT_VERSION_PRODUCTION':
      console.log(params);
      await updateDocument({
        collection: 'prompts',
        match: { _id: Number(params.id) },
        update: { productionVersion: Number(params.version) }
      }) as { data: Prompt }
      return {};
    default:
      return {};
  }
}

export default function PromptEditorRoute() {

  const data = useLoaderData();
  const navigation = useNavigation();
  const submit = useSubmit();

  const { prompt, promptVersion } = data;

  const onSavePromptVersion = ({ name, userPrompt, annotationSchema, _id }: { name: string, userPrompt: string, annotationSchema: any[], _id: string }) => {
    submit(JSON.stringify({ intent: 'UPDATE_PROMPT_VERSION', entityId: _id, payload: { name, userPrompt, annotationSchema } }), { method: 'PUT', encType: 'application/json' });
  }

  const onMakePromptVersionProductionClicked = () => {
    submit(JSON.stringify({ intent: 'MAKE_PROMPT_VERSION_PRODUCTION', payload: {} }), { method: 'POST', encType: 'application/json' });
  }

  return (
    <PromptEditor
      promptVersion={promptVersion.data}
      isLoading={navigation.state === 'loading'}
      onSavePromptVersion={onSavePromptVersion}
      isProduction={prompt.data.productionVersion === promptVersion.data.version}
      onMakePromptVersionProductionClicked={onMakePromptVersionProductionClicked}
    />
  )
}