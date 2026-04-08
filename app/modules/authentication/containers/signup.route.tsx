import { redirect, useFetcher, useSearchParams } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getInitialCreditsAmount from "~/modules/billing/helpers/getInitialCreditsAmount.server";
import Signup from "../components/signup";
import type { Route } from "./+types/signup.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (user) return redirect("/");
  return { initialCredits: getInitialCreditsAmount() };
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function SignupRoute({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();
  const errorType = searchParams.get("error");

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

  return (
    <Signup
      onSignupWithGithubClicked={onSignupWithGithubClicked}
      initialCredits={loaderData.initialCredits}
      errorType={errorType}
    />
  );
}
