import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import { createCookieSessionStorage, redirect } from "react-router";
import { Authenticator } from "remix-auth";
import { Strategy } from "remix-auth/strategy";
import { GitHubStrategy } from 'remix-auth-github';

export namespace LOCAL {
  export interface ConstructorOptions {
  }

  export interface VerifyOptions { }
}

const authenticator = new Authenticator<User>();


class LOCAL<User> extends Strategy<User, LOCAL.VerifyOptions> {
  name = "local";

  constructor(
    protected options: LOCAL.ConstructorOptions,
    verify: Strategy.VerifyFunction<User, LOCAL.VerifyOptions>
  ) {
    super(verify);
  }

  async authenticate(request: Request): Promise<User> {
    return await this.verify({});
  }
}

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    // @ts-ignore
    secrets: ["TAKA"],
    secure: process.env.NODE_ENV === "production",
  },
});



authenticator.use(
  new LOCAL(
    {},
    async () => {
      return await login();
    }
  ),
  "local"
);

authenticator.use(
  new GitHubStrategy(
    {
      //@ts-ignore
      clientId: process.env.GITHUB_CLIENT_ID,
      //@ts-ignore
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      //@ts-ignore
      redirectURI: process.env.AUTH_CALLBACK_URL,
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
  ),
  "github"
);


async function login(): Promise<User> {
  if (process.env.DOCUMENTS_ADAPTER === 'LOCAL') {
    const documents = getDocumentsAdapter();
    const user = await documents.getDocument({ collection: 'users', match: {} }) as { data: User | undefined };
    if (!user.data) {
      throw new Error("User not found");
    }
    return user.data;
  }
  throw new Error("Unsupported DOCUMENTS_ADAPTER");
}

export { authenticator, sessionStorage };