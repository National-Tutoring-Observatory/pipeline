import { useActionData, useNavigate, useSubmit } from "react-router";
import type { Route } from "./+types/prompts.route";
import Prompts from "../components/prompts";
import { toast } from "sonner"
import addDialog from "~/core/dialogs/addDialog";
import CreatePromptDialog from "../components/createPromptDialog";
import type { Prompt } from "../prompts.types";
import { useEffect } from "react";
import EditPromptDialog from "../components/editPromptDialog";
import DeletePromptDialog from "../components/deletePromptDialog";
import updateBreadcrumb from "~/core/app/updateBreadcrumb";
import getDocumentsAdapter from "~/core/documents/helpers/getDocumentsAdapter";

type Prompts = {
  data: [],
};

export async function loader({ params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const prompts = await documents.getDocuments({ collection: 'prompts', match: {}, sort: {} }) as Prompts;
  return { prompts };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { name, annotationType } = payload;

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'CREATE_PROMPT':
      if (typeof name !== "string") {
        throw new Error("Prompt name is required and must be a string.");
      }
      const prompt = await documents.createDocument({ collection: 'prompts', update: { name, annotationType, productionVersion: 1 } }) as { data: Prompt };
      await documents.createDocument({
        collection: 'promptVersions', update: {
          name: 'initial',
          prompt: prompt.data._id, version: 1,
          annotationSchema: [{
            "isSystem": true,
            "fieldKey": "_id",
            "fieldType": "string",
            "value": ""
          }, {
            "isSystem": true,
            "fieldKey": "identifiedBy",
            "fieldType": "string",
            "value": "AI"
          }]
        }
      });
      return {
        intent: 'CREATE_PROMPT',
        ...prompt
      }
    case 'UPDATE_PROMPT':
      return await documents.updateDocument({ collection: 'prompts', match: { _id: entityId }, update: { name } });
    case 'DELETE_PROMPT':
      return await documents.deleteDocument({ collection: 'prompts', match: { _id: entityId } })
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
      navigate(`/prompts/${actionData.data._id}/${actionData.data.productionVersion}`)
    }
  }, [actionData]);

  useEffect(() => {
    updateBreadcrumb([{ text: 'Prompts' }])
  }, []);

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
