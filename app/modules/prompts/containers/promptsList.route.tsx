import map from "lodash/map";
import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import { PromptService } from "../prompt";
import type { User } from "~/modules/users/users.types";
import annotationTypes from "../annotationTypes";
import type { Route } from "./+types/promptsList.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, "team");
  const url = new URL(request.url);
  const annotationType = url.searchParams.get("annotationType");

  const validAnnotationTypes = annotationTypes.map((a: any) => a.value);
  if (!annotationType || !validAnnotationTypes.includes(annotationType)) {
    throw new Error("Invalid or missing annotationType");
  }
  const prompts = await PromptService.find({
    match: {
      annotationType,
      team: { $in: teamIds },
      deletedAt: { $exists: false },
    },
  });
  return { prompts: { data: prompts } };
}
