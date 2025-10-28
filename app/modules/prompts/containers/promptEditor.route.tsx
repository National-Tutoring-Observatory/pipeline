import PromptEditor from "../components/promptEditor";
import type { Route } from "./+types/promptEditor.route";
import type { Prompt, PromptVersion } from "../prompts.types";
import type { User } from "~/modules/users/users.types";
import { redirect, useLoaderData, useNavigation, useSubmit, type ShouldRevalidateFunctionArgs } from "react-router";
import addDialog from "~/modules/dialogs/addDialog";
import SavePromptVersionDialogContainer from "./savePromptVersionDialogContainer";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import validatePromptOwnership from "../helpers/validatePromptOwnership";

export async function loader({ params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const prompt = await documents.getDocument({ collection: 'prompts', match: { _id: params.id } }) as { data: Prompt };
  const promptVersion = await documents.getDocument({ collection: 'promptVersions', match: { version: Number(params.version), prompt: params.id } }) as { data: PromptVersion };

  return { prompt, promptVersion };
}

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { name, userPrompt, annotationSchema } = payload;

  const documents = getDocumentsAdapter();

  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const promptVersion = await documents.getDocument({ collection: 'promptVersions', match: { _id: entityId } }) as { data: { prompt: string } };

  if (!promptVersion.data) {
    throw new Error('Prompt version not found');
  }

  await validatePromptOwnership({ user, promptId: promptVersion.data.prompt });

  switch (intent) {
    case 'UPDATE_PROMPT_VERSION':
      await documents.updateDocument({
        collection: 'promptVersions',
        match: { _id: entityId },
        update: { name, userPrompt, annotationSchema, hasBeenSaved: true, updatedAt: new Date(), }
      }) as { data: PromptVersion }
      return {};
    case 'MAKE_PROMPT_VERSION_PRODUCTION':
      await documents.updateDocument({
        collection: 'prompts',
        match: { _id: promptVersion.data.prompt },
        update: { productionVersion: Number(params.version) }
      }) as { data: Prompt }
      return {};
    default:
      return {};
  }
}

export function shouldRevalidate({
  formMethod,
  formAction,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (formMethod === 'POST' && formAction === '/api/promptVersionAlignment') {
    return false;
  }
  return defaultShouldRevalidate;
}

export default function PromptEditorRoute() {

  const data = useLoaderData();
  const navigation = useNavigation();
  const submit = useSubmit();

  const { prompt, promptVersion } = data;

  const onSavePromptVersion = ({ name, userPrompt, annotationSchema }: { name: string, userPrompt: string, annotationSchema: any[] }) => {
    addDialog(
      <SavePromptVersionDialogContainer
        userPrompt={userPrompt}
        annotationSchema={annotationSchema}
        team={prompt.data.team}
        onSaveClicked={() => {
          submit(JSON.stringify({ intent: 'UPDATE_PROMPT_VERSION', entityId: promptVersion.data._id, payload: { name, userPrompt, annotationSchema } }), { method: 'PUT', encType: 'application/json' });
        }}
      />
    );
  }

  const onMakePromptVersionProduction = () => {
    submit(JSON.stringify({ intent: 'MAKE_PROMPT_VERSION_PRODUCTION', entityId: promptVersion.data._id, payload: {} }), { method: 'POST', encType: 'application/json' });
  }

  return (
    <PromptEditor
      promptVersion={promptVersion.data}
      isLoading={navigation.state === 'loading'}
      onSavePromptVersion={onSavePromptVersion}
      isProduction={prompt.data.productionVersion === promptVersion.data.version}
      onMakePromptVersionProduction={onMakePromptVersionProduction}
    />
  )
}
