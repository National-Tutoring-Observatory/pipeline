import { redirect, useFetcher } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import Signup from "../components/signup";
import type { Route } from "./+types/signup.route";

export async function loader({ request }: Route.LoaderArgs) {
  if (process.env.OPEN_SIGNUP !== "true") return redirect("/");
  const user = await getSessionUser({ request });
  if (user) return redirect("/");
  return {};
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function SignupRoute() {
  const fetcher = useFetcher();

  const onSignupWithGithubClicked = () => {
    fetcher.submit(
      { provider: "github" },
      {
        action: "/api/authentication",
        method: "post",
        encType: "application/json",
      },
    );
  };

  return <Signup onSignupWithGithubClicked={onSignupWithGithubClicked} />;
}
