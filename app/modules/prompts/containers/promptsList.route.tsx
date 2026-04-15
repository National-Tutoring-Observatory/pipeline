import map from "lodash/map";
import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import type { User } from "~/modules/users/users.types";
import isValidAnnotationType from "../helpers/isValidAnnotationType";
import { PromptService } from "../prompt";
import type { Route } from "./+types/promptsList.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }
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
