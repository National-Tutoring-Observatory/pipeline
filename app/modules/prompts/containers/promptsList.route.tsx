import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/promptsList.route";


export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }
  const url = new URL(request.url);
  const annotationType = url.searchParams.get('annotationType');
  const documents = getDocumentsAdapter();
  const result = await documents.getDocuments({ collection: 'prompts', match: { annotationType }, sort: {} });
  const prompts = { data: result.data as any[] };
  return { prompts };
}
