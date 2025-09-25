import { redirect } from "react-router";
import type { Route } from "./+types/authCallback.route";
import { authenticator, sessionStorage } from "../authentication.server";

export async function loader({ request, params }: Route.LoaderArgs) {

  let user = await authenticator.authenticate(params.provider, request);

  let session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );

  session.set("user", user);

  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(session),
  });

  return redirect('/', { headers });

}