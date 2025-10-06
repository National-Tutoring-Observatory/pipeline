import { redirect } from "react-router";
import { GitHubStrategy } from "remix-auth-github";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import find from 'lodash/find';

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

    console.log(githubUser);

    const documents = getDocumentsAdapter();

    let user = await documents.getDocument({ collection: 'users', match: { githubId: githubUser.id, hasGithubSSO: true } }) as { data: User };

    if (!user.data) {
      throw redirect("/?error=UNREGISTERED");
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

    user = await documents.updateDocument({
      collection: 'users',
      match: { _id: user.data._id },
      update: {
        username: githubUser.name,
        email: email.email,
      }
    }) as { data: User };

    return user.data;
  }
);

export default githubStrategy;