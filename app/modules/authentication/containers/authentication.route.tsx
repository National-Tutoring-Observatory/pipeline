import { authenticator, sessionStorage } from "../authentication.server";
import type { Route } from "./+types/authentication.route";

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

export async function action({ request }: Route.ActionArgs) {
  const clonedRequest = request.clone();

  const data = await clonedRequest.json();

  if (clonedRequest.method === 'DELETE') {
    let session = await sessionStorage.getSession(clonedRequest.headers.get("cookie"));

    return Response.json({}, { headers: { "Set-Cookie": await sessionStorage.destroySession(session) } });
  }

  return await authenticator.authenticate(data.provider, request);

}