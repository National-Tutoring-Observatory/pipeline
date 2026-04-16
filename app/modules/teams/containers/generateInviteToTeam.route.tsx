import crypto from "crypto";
import { data } from "react-router";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import { UserService } from "~/modules/users/user";
import TeamAuthorization from "../authorization";
import { isTeamRole } from "../teams.types";
import type { Route } from "./+types/generateInviteToTeam.route";

export async function action({ request }: Route.ActionArgs) {
  const user = await requireAuth({ request });

  const { intent, payload = {} } = await request.json();
  const { teamId, role, name } = payload;

  if (intent === "GENERATE_INVITE_LINK") {
    if (!TeamAuthorization.Users.canInvite(user, payload.teamId)) {
      return data(
        {
          errors: {
            general: "You do not have permission to invite users to this team.",
          },
        },
        { status: 403 },
      );
    }

    if (!isTeamRole(role)) {
      return data({ errors: { role: "Invalid role" } }, { status: 400 });
    }

    const inviteId = crypto.randomBytes(21).toString("hex").slice(0, 21);

    const newUser = await UserService.create({
      role: "USER",
      name,
      isRegistered: false,
      inviteId,
      invitedAt: new Date(),
      teams: [{ team: teamId, role }],
      orcidId: "",
      hasOrcidSSO: false,
      githubId: 0,
      hasGithubSSO: false,
      featureFlags: [],
      registeredAt: new Date(),
    });

    return { data: newUser };
  }

  return data({ errors: { intent: "Invalid intent" } }, { status: 400 });
}
