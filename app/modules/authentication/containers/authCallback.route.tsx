import { redirect } from "react-router";
import trackServerEvent from "~/modules/analytics/helpers/trackServerEvent.server";
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

  trackServerEvent({ name: "user_logged_in", userId: user._id });

  if (!user.onboardingComplete) {
    return redirect("/onboarding", { headers });
  }

  return redirect("/", { headers });
}
