import { redirect } from "react-router";
import { GitHubStrategy } from "remix-auth-github";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import find from 'lodash/find';
import { sessionStorage } from "../authentication.server";

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

    let user = await documents.getDocument({ collection: 'users', match: { githubId: githubUser.id, hasGithubSSO: true } }) as { data: User };

    let update: any = {};

    if (!user.data) {

      // if no user but is invite, update the invitedUser
      if (isInvitedUser) {
        user = await documents.getDocument({ collection: 'users', match: { inviteId } }) as { data: User };
        if (user.data) {
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
      // Remove old invited user.
      console.log('update current user to take on teams and delete current user');
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