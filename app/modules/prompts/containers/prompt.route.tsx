import { useEffect } from "react";
import { data, redirect, useFetcher, useLoaderData, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import PromptAuthorization from "~/modules/prompts/authorization";
import EditPromptDialog from "../components/editPromptDialog";
import Prompt from '../components/prompt';
import { PromptService } from "../prompt";
import type { Prompt as PromptType } from "../prompts.types";
import { PromptVersionService } from "../promptVersion";
import type { Route } from "./+types/prompt.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (!user) {
    return redirect('/');
  }
  const prompt = await PromptService.findById(params.id);
  if (!prompt) {
    return redirect('/prompts');
  }
  if (!PromptAuthorization.canView(user, prompt)) {
    throw new Error('You do not have permission to view this prompt.');
  }
  const promptVersions = await PromptVersionService.find({
    match: { prompt: params.id },
    sort: { version: -1 },
  });
  return { prompt, promptVersions };
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
  const prompt = await PromptService.findById(entityId);
  if (!prompt) {
    throw new Error('Prompt not found');
  }
  if (!PromptAuthorization.canUpdate(user, prompt)) {
    throw new Error("You do not have permission to update this prompt.");
  }

  switch (intent) {
    case 'CREATE_PROMPT_VERSION': {
      const previousVersionDocs = await PromptVersionService.find({
        match: { prompt: entityId, version: Number(version) }
      });

      if (previousVersionDocs.length === 0) {
        return data(
          { errors: { general: 'Previous prompt version not found' } },
          { status: 400 }
        );
      }

      const promptVersion = await PromptVersionService.createNextVersion(
        entityId,
        previousVersionDocs[0]
      );

      return data({
        success: true,
        intent: 'CREATE_PROMPT_VERSION',
        data: promptVersion
      });
    }
    case 'UPDATE_PROMPT': {
      const { name } = payload;
      if (typeof name !== 'string' || !name.trim()) {
        return data(
          { errors: { general: 'Prompt name is required' } },
          { status: 400 }
        );
      }

      const updated = await PromptService.updateById(entityId, { name: name.trim() });
      return data({
        success: true,
        intent: 'UPDATE_PROMPT',
        data: updated
      });
    }
    default:
      return data(
        { errors: { general: 'Invalid intent' } },
        { status: 400 }
      );
  }
}

export default function PromptRoute() {

  const loaderData = useLoaderData();
  const navigate = useNavigate();

  const { id, version } = useParams();

  const fetcher = useFetcher();

  const { prompt, promptVersions } = loaderData;

  const submitCreatePromptVersion = () => {
    fetcher.submit(
      JSON.stringify({ intent: 'CREATE_PROMPT_VERSION', entityId: id, payload: { version } }),
      { method: 'POST', encType: 'application/json' }
    );
  }

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.success && fetcher.data.intent === 'CREATE_PROMPT_VERSION') {
        navigate(`/prompts/${fetcher.data.data.prompt}/${fetcher.data.data.version}`);
      } else if (fetcher.data.success && fetcher.data.intent === 'UPDATE_PROMPT') {
        toast.success('Prompt updated');
        addDialog(null);
      } else if (fetcher.data.errors) {
        toast.error(fetcher.data.errors.general || 'An error occurred');
      }
    }
  }, [fetcher.state, fetcher.data, navigate]);

  const breadcrumbs = [{
    text: 'Prompts', link: '/prompts'
  }, {
    text: prompt.name
  }];

  const openEditPromptDialog = (p: PromptType) => {
    addDialog(<EditPromptDialog
      prompt={p}
      onEditPromptClicked={submitEditPrompt}
      isSubmitting={fetcher.state === 'submitting'}
    />);
  }

  const submitEditPrompt = (updatedPrompt: PromptType) => {
    fetcher.submit(
      JSON.stringify({ intent: 'UPDATE_PROMPT', entityId: updatedPrompt._id, payload: { name: updatedPrompt.name } }),
      { method: 'PUT', encType: 'application/json' }
    );
  }

  return (
    <Prompt
      prompt={prompt}
      promptVersions={promptVersions}
      version={Number(version)}
      breadcrumbs={breadcrumbs}
      onCreatePromptVersionClicked={submitCreatePromptVersion}
      onEditPromptButtonClicked={openEditPromptDialog}
    />
  );
}
