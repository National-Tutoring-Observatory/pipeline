import getDocuments from "~/core/documents/getDocuments";
import createDocument from "~/core/documents/createDocument";
import { useActionData, useNavigate, useSubmit } from "react-router";
import type { Route } from "./+types/prompts.route";
import Prompts from "../components/prompts";
import deleteDocument from "~/core/documents/deleteDocument";
import { toast } from "sonner"
import addDialog from "~/core/dialogs/addDialog";
import CreatePromptDialog from "../components/createPromptDialog";
import type { Prompt } from "../prompts.types";
import updateDocument from "~/core/documents/updateDocument";
import { useEffect } from "react";
import EditPromptDialog from "../components/editPromptDialog";
import DeletePromptDialog from "../components/deletePromptDialog";

type Prompts = {
  data: [],
};

export async function loader({ params }: Route.LoaderArgs) {
  const prompts = await getDocuments({ collection: 'prompts', match: {} }) as Prompts;
  return { prompts };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { name, annotationType } = payload;

  switch (intent) {
    case 'CREATE_PROMPT':
      if (typeof name !== "string") {
        throw new Error("Prompt name is required and must be a string.");
      }
      const prompt = await createDocument({ collection: 'prompts', update: { name, annotationType, latestVersion: 1 } }) as { data: Prompt };
      await createDocument({ collection: 'promptVersions', update: { name: 'initial', prompt: prompt.data._id, version: 1 } });
      return {
        intent: 'CREATE_PROMPT',
        ...prompt
      }
    case 'UPDATE_PROMPT':
      return await updateDocument({ collection: 'prompts', match: { _id: Number(entityId) }, update: { name } });
    case 'DELETE_PROMPT':
      return await deleteDocument({ collection: 'prompts', match: { _id: Number(entityId) } })
    default:
      return {};
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}


export default function PromptsRoute({ loaderData }: Route.ComponentProps) {
  const { prompts } = loaderData;
  const submit = useSubmit();
  const actionData = useActionData();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.intent === 'CREATE_PROMPT') {
      navigate(`/prompts/${actionData.data._id}/${actionData.data.latestVersion}`)
    }
  }, [actionData]);

  const onCreatePromptButtonClicked = () => {
    addDialog(
      <CreatePromptDialog
        onCreateNewPromptClicked={onCreateNewPromptClicked}
      />
    );
  }

  const onEditPromptButtonClicked = (prompt: Prompt) => {
    addDialog(<EditPromptDialog
      prompt={prompt}
      onEditPromptClicked={onEditPromptClicked}
    />);
  }

  const onDeletePromptButtonClicked = (prompt: Prompt) => {
    addDialog(
      <DeletePromptDialog
        prompt={prompt}
        onDeletePromptClicked={onDeletePromptClicked}
      />
    );
  }

  const onCreateNewPromptClicked = ({ name, annotationType }: { name: string, annotationType: string }) => {
    submit(JSON.stringify({ intent: 'CREATE_PROMPT', payload: { name, annotationType } }), { method: 'POST', encType: 'application/json' });
  }

  const onEditPromptClicked = (prompt: Prompt) => {
    submit(JSON.stringify({ intent: 'UPDATE_PROMPT', entityId: prompt._id, payload: { name: prompt.name } }), { method: 'PUT', encType: 'application/json' }).then(() => {
      toast.success('Updated prompt');
    });
  }

  const onDeletePromptClicked = (promptId: string) => {
    submit(JSON.stringify({ intent: 'DELETE_PROMPT', entityId: promptId }), { method: 'DELETE', encType: 'application/json' }).then(() => {
      toast.success('Deleted prompt');
    });
  }

  return (
    <Prompts
      prompts={prompts?.data}
      onCreatePromptButtonClicked={onCreatePromptButtonClicked}
      onEditPromptButtonClicked={onEditPromptButtonClicked}
      onDeletePromptButtonClicked={onDeletePromptButtonClicked}
    />
  );
}
