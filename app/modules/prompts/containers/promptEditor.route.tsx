import { redirect, useLoaderData, useNavigation, useSubmit, type ShouldRevalidateFunctionArgs } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import PromptEditor from "../components/promptEditor";
import { isPromptOwner, validatePromptOwnership } from "../helpers/promptOwnership";
import type { Prompt, PromptVersion } from "../prompts.types";
import type { Route } from "./+types/promptEditor.route";
import SavePromptVersionDialogContainer from "./savePromptVersionDialogContainer";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  if (!(await isPromptOwner({ user, promptId: params.id }))) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();
  const prompt = await documents.getDocument<Prompt>({ collection: 'prompts', match: { _id: params.id } });

  if (!prompt.data) {
    return redirect('/');
  }

  const promptVersion = await documents.getDocument<PromptVersion>({ collection: 'promptVersions', match: { version: Number(params.version), prompt: params.id } });

  if (!promptVersion.data) {
    return redirect('/');
  }

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

  const promptVersion = await documents.getDocument<PromptVersion>({ collection: 'promptVersions', match: { _id: entityId } });

  if (!promptVersion.data) {
    throw new Error('Prompt version not found');
  }

  const promptId = (promptVersion.data.prompt as string);

  await validatePromptOwnership({ user, promptId });

  switch (intent) {
    case 'UPDATE_PROMPT_VERSION':
      await documents.updateDocument<PromptVersion>({
        collection: 'promptVersions',
        match: { _id: entityId },
        update: { name, userPrompt, annotationSchema, hasBeenSaved: true, updatedAt: new Date(), }
      })
      return {};
    case 'MAKE_PROMPT_VERSION_PRODUCTION':
      await documents.updateDocument<Prompt>({
        collection: 'prompts',
        match: { _id: promptId },
        update: { productionVersion: Number(params.version) }
      })
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
