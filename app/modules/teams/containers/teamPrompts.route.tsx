import { useEffect } from "react";
import { Link, useLoaderData, useOutletContext, useParams } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Prompt } from "~/modules/prompts/prompts.types";
import type { Route } from "./+types/teamPrompts.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const promptsResult = await documents.getDocuments<Prompt>({ collection: 'prompts', match: { team: params.id } });
  return { prompts: promptsResult.data };
}

export default function TeamPromptsRoute() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();
  const ctx = useOutletContext<any>();

  useEffect(() => {
    updateBreadcrumb([
      { text: 'Teams', link: '/teams' },
      { text: ctx.team.name, link: `/teams/${params.id}` },
      { text: 'Prompts' }
    ]);
  }, [params.id]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2>Prompts</h2>
        {(ctx.canCreatePrompts) && (
          <button onClick={ctx.onCreatePromptButtonClicked} className="btn">
            Create prompt
          </button>
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
              ctx.canCreatePrompts ? (
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
