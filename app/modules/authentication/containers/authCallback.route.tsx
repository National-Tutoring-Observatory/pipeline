import { redirect } from "react-router";
import type { Route } from "./+types/authCallback.route";
import { authenticator, sessionStorage } from "../authentication.server";

export async function loader({ request }: Route.LoaderArgs) {
  let user = await authenticator.authenticate("github", request);

  let session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );

  session.set("user", user);

  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(session),
  });

  return redirect('/', { headers });
  // now you have the user object with the data you returned in the verify function
}