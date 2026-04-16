import map from "lodash/map";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import isValidAnnotationType from "../helpers/isValidAnnotationType";
import { PromptService } from "../prompt";
import type { Route } from "./+types/promptsList.route";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth({ request });
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, "team");
  const url = new URL(request.url);
  const annotationType = url.searchParams.get("annotationType");

  if (!isValidAnnotationType(annotationType)) {
    throw new Error("Invalid or missing annotationType");
  }

  const prompts = await PromptService.findWithSavedVersions({
    match: {
      annotationType,
      team: { $in: teamIds },
      deletedAt: { $exists: false },
    },
  });

  return { prompts: { data: prompts } };
}
