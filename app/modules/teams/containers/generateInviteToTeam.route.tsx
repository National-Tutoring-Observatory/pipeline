import crypto from 'crypto';
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { UserService } from "~/modules/users/user";
import type { User } from "~/modules/users/users.types";
import TeamAuthorization from "../authorization";
import type { Route } from "./+types/generateInviteToTeam.route";

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { teamId, role, username } = payload;

  if (intent === 'GENERATE_INVITE_LINK') {

    const user = await getSessionUser({ request }) as User;

    if (!user) {
      return {};
    }

    if (!TeamAuthorization.Users.canInvite(user, payload.teamId)) {
      throw new Error('You do not have permission to invite users to this team.');
    }

    const inviteId = crypto.randomBytes(21).toString('hex').slice(0, 21);

    const newUser = await UserService.create({
      role: "USER",
      username,
      isRegistered: false,
      inviteId,
      invitedAt: new Date(),
      teams: [{
        team: teamId,
        role
      }],
      orcidId: '',
      hasOrcidSSO: false,
      githubId: 0,
      hasGithubSSO: false,
      featureFlags: [],
      registeredAt: new Date(),
    } as any);

    return { data: newUser }
  }


  return {};
}
