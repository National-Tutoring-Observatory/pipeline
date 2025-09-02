import PromptEditor from "../components/promptEditor";
import type { Route } from "./+types/promptEditor.route";
import type { Prompt, PromptVersion } from "../prompts.types";
import { useLoaderData, useNavigation, useSubmit, type ShouldRevalidateFunctionArgs } from "react-router";
import addDialog from "~/core/dialogs/addDialog";
import SavePromptVersionDialogContainer from "./savePromptVersionDialogContainer";
import getDocumentsAdapter from "~/core/documents/helpers/getDocumentsAdapter";

export async function loader({ params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const prompt = await documents.getDocument({ collection: 'prompts', match: { _id: parseInt(params.id) } }) as { data: Prompt };
  const promptVersion = await documents.getDocument({ collection: 'promptVersions', match: { version: parseInt(params.version), prompt: parseInt(params.id) } }) as { data: PromptVersion };

  return { prompt, promptVersion };
}

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { name, userPrompt, annotationSchema } = payload;

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'UPDATE_PROMPT_VERSION':
      await documents.updateDocument({
        collection: 'promptVersions',
        match: { _id: Number(entityId) },
        update: { name, userPrompt, annotationSchema, hasBeenSaved: true, updatedAt: new Date(), }
      }) as { data: PromptVersion }
      return {};
    case 'MAKE_PROMPT_VERSION_PRODUCTION':
      await documents.updateDocument({
        collection: 'prompts',
        match: { _id: Number(params.id) },
        update: { productionVersion: Number(params.version) }
      }) as { data: Prompt }
      return {};
    default:
      return {};
  }
}

export function shouldRevalidate({
  formMethod,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (formMethod === 'POST') {
    return false;
  }
  return defaultShouldRevalidate;
}

export default function PromptEditorRoute() {

  const data = useLoaderData();
  const navigation = useNavigation();
  const submit = useSubmit();

  const { prompt, promptVersion } = data;

  const onSavePromptVersion = ({ name, userPrompt, annotationSchema, _id }: { name: string, userPrompt: string, annotationSchema: any[], _id: string }) => {
    addDialog(
      <SavePromptVersionDialogContainer
        userPrompt={userPrompt}
        annotationSchema={annotationSchema}
        onSaveClicked={() => {
          submit(JSON.stringify({ intent: 'UPDATE_PROMPT_VERSION', entityId: _id, payload: { name, userPrompt, annotationSchema } }), { method: 'PUT', encType: 'application/json' });
        }}
      />
    );
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