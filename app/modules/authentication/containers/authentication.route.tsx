import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Route } from "./+types/authentication.route";
import type { User } from "~/modules/users/users.types";
import { createCookieSessionStorage } from "react-router";
import { Authenticator } from "remix-auth";
import { Strategy } from "remix-auth/strategy";

export namespace LOCAL {
  export interface ConstructorOptions {
  }

  export interface VerifyOptions { }
}

const setup = () => {

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

  const authenticator = new Authenticator<User>();

  authenticator.use(
    new LOCAL(
      {},
      async () => {
        return await login();
      }
    ),
    "local"
  );
  return { sessionStorage, authenticator };
}

const { sessionStorage, authenticator } = setup();

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

export async function loader({ request }: Route.LoaderArgs) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let user = session.get("user");

  if (!user) {
    if (process.env.DOCUMENTS_ADAPTER === 'LOCAL') {
      user = await authenticator.authenticate("local", request);

      let session = await sessionStorage.getSession(
        request.headers.get("cookie")
      );

      session.set("user", user);

      const headers = new Headers({
        "Set-Cookie": await sessionStorage.commitSession(session),
      });

      return Response.json({ authentication: { data: user } }, { headers });
    }
    return {
      authentication: {}
    }
  }

  return { authentication: { data: user } };

}