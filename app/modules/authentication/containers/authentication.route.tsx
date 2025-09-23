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

  // console.log(json.provider);
  // if (json.provider === 'github') {
  return await authenticator.authenticate("github", request);
  // }
}