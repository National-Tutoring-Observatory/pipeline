import { redirect } from "react-router";
import sessionStorage from "../../../../sessionStorage";
import { authenticator } from "../authentication.server";
import type { Route } from "./+types/authCallback.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await authenticator.authenticate(params.provider, request);

  const session = await sessionStorage.getSession(
    request.headers.get("cookie"),
  );

  session.set("user", user);

  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(session),
  });

  return redirect("/", { headers });
}
