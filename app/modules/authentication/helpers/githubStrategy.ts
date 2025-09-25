import { redirect } from "react-router";
import { GitHubStrategy } from "remix-auth-github";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";

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

    let response = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tokens.accessToken()}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    let githubUser = await response.json();

    const documents = getDocumentsAdapter();

    const user = await documents.getDocument({ collection: 'users', match: { githubId: githubUser.id, hasGithubSSO: true } }) as { data: User };

    if (!user.data) {
      throw redirect("/?error=UNREGISTERED");
    }

    return user.data;
  }
);

export default githubStrategy;