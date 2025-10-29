import type { Route } from "./+types/promptsList.route";
import type { User } from "~/modules/users/users.types";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { redirect } from "react-router";

type Prompts = {
  data: [],
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }
  const url = new URL(request.url);
  const annotationType = url.searchParams.get('annotationType');
  const documents = getDocumentsAdapter();
  const prompts = await documents.getDocuments({ collection: 'prompts', match: { annotationType }, sort: {} }) as Prompts;
  return { prompts };
}
