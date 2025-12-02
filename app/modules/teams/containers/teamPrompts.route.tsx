import { Button } from '@/components/ui/button';
import { useContext, useEffect } from "react";
import { Link, redirect, useActionData, useLoaderData, useNavigate, useOutletContext, useParams, useSubmit } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import { AuthenticationContext } from '~/modules/authentication/containers/authentication.container';
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import CreatePromptDialog from "~/modules/prompts/components/createPromptDialog";
import type { Prompt } from "~/modules/prompts/prompts.types";
import { validateTeamMembership } from "~/modules/teams/helpers/teamMembership";
import type { User } from "~/modules/users/users.types";
import getUserRoleInTeam from '../helpers/getUserRoleInTeam';
import { isTeamAdmin } from '../helpers/teamAdmin';
import type { Route } from "./+types/teamPrompts.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (!user) {
    return redirect('/');
  }
  if (!(await isTeamAdmin({ user, teamId: params.id }))) {
    return redirect('/');
  }
  const documents = getDocumentsAdapter();
  const promptsResult = await documents.getDocuments<Prompt>({ collection: 'prompts', match: { team: params.id } });
  return { prompts: promptsResult.data };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { intent, payload = {} } = await request.json();
  const { name, annotationType } = payload;

  const user = await getSessionUser({ request });
  if (!user) return { redirect: '/' };

  await validateTeamMembership({ user, teamId: params.id });

  const documents = getDocumentsAdapter();

  if (intent === 'CREATE_PROMPT') {
    if (typeof name !== 'string') throw new Error('Prompt name is required and must be a string.');

    const prompt = await documents.createDocument<Prompt>({ collection: 'prompts', update: { name, annotationType, team: params.id, productionVersion: 1 } });
    await documents.createDocument({
      collection: 'promptVersions',
      update: {
        name: 'initial',
        prompt: prompt.data._id,
        version: 1,
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
    };
  }

  return {};
}

export default function TeamPromptsRoute() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();
  const ctx = useOutletContext<any>();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigate = useNavigate();
  const authentication = useContext(AuthenticationContext) as User | null;
  const canCreatePrompts = !!authentication && !!getUserRoleInTeam({ user: authentication, team: ctx.team }).role


  useEffect(() => {
    updateBreadcrumb([
      { text: 'Teams', link: '/teams' },
      { text: ctx.team.name, link: `/teams/${params.id}` },
      { text: 'Prompts' }
    ]);
  }, [params.id]);

  useEffect(() => {
    if (actionData?.intent === 'CREATE_PROMPT') {
      navigate(`/prompts/${actionData.data._id}/${actionData.data.productionVersion}`);
    }
  }, [actionData]);

  const onCreatePromptButtonClicked = () => {
    addDialog(
      <CreatePromptDialog
        hasTeamSelection={false}
        onCreateNewPromptClicked={onCreateNewPromptClicked}
      />
    );
  }

  const onCreateNewPromptClicked = ({ name, annotationType }: { name: string, annotationType: string }) => {
    submit(JSON.stringify({ intent: 'CREATE_PROMPT', payload: { name, annotationType } }), { method: 'POST', encType: 'application/json' });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">Prompts</div>
        {(canCreatePrompts) && (
          <Button size="sm" onClick={onCreatePromptButtonClicked}>
            Create prompt
          </Button>
        )}
      </div>
      <div>
        {(data.prompts.length === 0) && (
          <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
            No prompts are associated with this team
          </div>
        )}
        {(data.prompts.length > 0) && (
          <div className="mt-4 border border-black/10 rounded-md ">
            {data.prompts.map((prompt: Prompt) => (
              canCreatePrompts ? (
                <Link
                  key={prompt._id}
                  to={`/prompts/${prompt._id}/${prompt.productionVersion}`}
                  className="block border-b border-black/10 p-4 last:border-0 hover:bg-gray-50 text-sm"
                >
                  {prompt.name}
                </Link>
              ) : (
                <div
                  key={prompt._id}
                  className="block border-b border-black/10 p-4 last:border-0 text-sm"
                >
                  {prompt.name}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
