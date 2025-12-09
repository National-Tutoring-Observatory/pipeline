import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Prompt } from "~/modules/prompts/prompts.types";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/promptsList.route";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import { map } from "lodash";


export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, 'team');
  const url = new URL(request.url);
  const annotationType = url.searchParams.get('annotationType');
  const documents = getDocumentsAdapter();
  const result = await documents.getDocuments<Prompt>({ collection: 'prompts', match: { annotationType, team: { $in: teamIds } }, sort: {} });
  const prompts = { data: result.data };
  return { prompts };
}
