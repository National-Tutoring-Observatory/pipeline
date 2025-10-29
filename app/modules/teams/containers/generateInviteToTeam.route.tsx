import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Route } from "./+types/generateInviteToTeam.route";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import type { User } from "~/modules/users/users.types";
import crypto from 'crypto';
import { validateTeamAdmin } from "../helpers/validateTeamAdmin";

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

    validateTeamAdmin({ user, teamId: payload.teamId });

    const documents = getDocumentsAdapter();

    const inviteId = crypto.randomBytes(21).toString('hex').slice(0, 21);

    const newUser = await documents.createDocument({
      collection: 'users',
      update: {
        role: "USER",
        username,
        isRegistered: false,
        inviteId,
        invitedAt: new Date(),
        teams: [{
          team: teamId,
          role
        }],
        createdBy: user._id
      }
    });

    return newUser
  }


  return {};
}