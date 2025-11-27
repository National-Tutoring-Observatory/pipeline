import dayjs from "dayjs";
import find from 'lodash/find';
import { redirect } from "react-router";
import { GitHubStrategy } from "remix-auth-github";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User, UserTeam } from "~/modules/users/users.types";
// @ts-ignore
import sessionStorage from '../../../../sessionStorage.js';

const githubStrategy = new GitHubStrategy<User>(
  {
    //@ts-ignore
    clientId: process.env.GITHUB_CLIENT_ID,
    //@ts-ignore
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    //@ts-ignore
    redirectURI: `${process.env.AUTH_CALLBACK_URL}/github`,
    scopes: ["user:email"],
  },
  async ({ tokens, request }) => {

    let userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tokens.accessToken()}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    let emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tokens.accessToken()}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });


    let githubUser = await userResponse.json();

    let emails = await emailsResponse.json();

    let session = await sessionStorage.getSession(request.headers.get("cookie"));

    const inviteId = session.get("inviteId");

    const isInvitedUser = !!inviteId;

    const documents = getDocumentsAdapter();

    let user = await documents.getDocument<User>({ collection: 'users', match: { githubId: githubUser.id, hasGithubSSO: true } });

    let update: any = {};

    if (!user.data) {
      // if no user but is invite, update the invitedUser
      if (isInvitedUser) {
        user = await documents.getDocument<User>({ collection: 'users', match: { inviteId } });

        if (user.data) {
          if (dayjs().isAfter(dayjs(user.data.invitedAt).add(48, 'hours'))) {
            throw redirect("/?error=EXPIRED_INVITE");
          }
          update.inviteId = null;
          update.isRegistered = true;
          update.registeredAt = new Date();
          update.githubId = githubUser.id;
          update.hasGithubSSO = true;
        } else {
          throw redirect("/?error=UNREGISTERED");
        }
      } else {
        throw redirect("/?error=UNREGISTERED");
      }
    } else if (isInvitedUser) {
      // If user already exists, check teams and add if that team does not exist on the user.
      const invitedUser = await documents.getDocument<User>({ collection: 'users', match: { inviteId } });

      if (!invitedUser.data) throw redirect("/?error=UNREGISTERED");

      if (dayjs().isAfter(dayjs(invitedUser.data.invitedAt).add(48, 'hours'))) {
        throw redirect("/?error=EXPIRED_INVITE");
      }

      const invitedUserTeam = invitedUser.data.teams[0] as UserTeam
      const currentUserTeams = user.data.teams;
      const isPartOfInvitedTeam = find(currentUserTeams, { team: invitedUserTeam.team });
      if (!isPartOfInvitedTeam) {
        currentUserTeams.push(invitedUserTeam);
        update.teams = currentUserTeams;
      }
      // Remove old invited user.
      await documents.deleteDocument({ collection: 'users', match: { _id: invitedUser.data._id } });
    }

    let email = find(emails, (email) => {
      if (email.primary) {
        return email;
      }
    });

    if (!email) {
      if (emails.length > 0) {
        email = emails[0];
      } else {
        email = {};
      }
    }

    update.username = githubUser.name || githubUser.login;
    update.email = email.email;

    user = await documents.updateDocument({
      collection: 'users',
      match: { _id: user.data._id },
      update
    }) as { data: User };

    return user.data;
  }
);

export default githubStrategy;
