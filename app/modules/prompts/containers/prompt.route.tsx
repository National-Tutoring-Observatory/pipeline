import pick from 'lodash/pick';
import { useEffect } from "react";
import { redirect, useActionData, useFetcher, useLoaderData, useNavigate, useParams, useSubmit } from "react-router";
import { toast } from "sonner";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import PromptAuthorization from "~/modules/prompts/authorization";
import EditPromptDialog from "../components/editPromptDialog";
import Prompt from '../components/prompt';
import type { Prompt as PromptType, PromptVersion } from "../prompts.types";
import type { Route } from "./+types/prompt.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (!user) {
    return redirect('/');
  }
  const documents = getDocumentsAdapter();
  const promptDoc = await documents.getDocument<PromptType>({ collection: 'prompts', match: { _id: params.id } });
  if (!promptDoc.data) {
    return redirect('/prompts');
  }
  if (!PromptAuthorization.canView(user, (promptDoc.data.team as any)._id || promptDoc.data.team)) {
    throw new Error('You do not have permission to view this prompt.');
  }
  const promptVersions = await documents.getDocuments<PromptVersion>({
    collection: 'promptVersions',
    match: { prompt: params.id },
    sort: { version: -1 },
  });
  return { prompt: promptDoc, promptVersions };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { version } = payload;

  const user = await getSessionUser({ request });
  if (!user) {
    return redirect('/');
  }
  const documents = getDocumentsAdapter();
  const versionPromptDoc = await documents.getDocument<PromptType>({ collection: 'prompts', match: { _id: entityId } });
  if (!versionPromptDoc.data) throw new Error('Prompt not found');
  if (!PromptAuthorization.canUpdate(user, (versionPromptDoc.data.team as any)._id || versionPromptDoc.data.team)) {
    throw new Error("You do not have permission to update this prompt.");
  }

  switch (intent) {
    case 'CREATE_PROMPT_VERSION':
      const previousPromptVerion = await documents.getDocument<PromptVersion>({ collection: 'promptVersions', match: { prompt: entityId, version: Number(version) } });
      if (!previousPromptVerion.data) throw new Error('Previous prompt version not found');
      const newPromptAttributes = pick(previousPromptVerion.data, ['userPrompt', 'annotationSchema']);
      const promptVerions = await documents.getDocuments<PromptVersion>({ collection: 'promptVersions', match: { prompt: entityId }, sort: {} }) as { count: number };
      const promptVersion = await documents.createDocument<PromptVersion>({ collection: 'promptVersions', update: { ...newPromptAttributes, name: `${previousPromptVerion.data.name.replace(/#\d+/g, '').trim()} #${promptVerions.count + 1}`, prompt: entityId, version: promptVerions.count + 1 } })
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
  const fetcher = useFetcher();

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

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      toast.success('Updated prompt');
    }
  }, [fetcher.state, fetcher.data]);

  const onEditPromptButtonClicked = (p: PromptType) => {
    addDialog(<EditPromptDialog
      prompt={p}
      onEditPromptClicked={(updatedPrompt: PromptType) => {
        fetcher.submit(JSON.stringify({ intent: 'UPDATE_PROMPT', entityId: updatedPrompt._id, payload: { name: updatedPrompt.name } }), { method: 'PUT', encType: 'application/json', action: '/prompts' });
      }}
    />);
  }

  return (
    <Prompt
      prompt={prompt.data}
      promptVersions={promptVersions.data}
      version={Number(version)}
      onCreatePromptVersionClicked={onCreatePromptVersionClicked}
      onEditPromptButtonClicked={onEditPromptButtonClicked}
    />
  );
}
