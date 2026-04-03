import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getInitialCreditsAmount from "~/modules/billing/helpers/getInitialCreditsAmount.server";
import isBillingEnabled from "~/modules/billing/helpers/isBillingEnabled.server";
import Home from "../components/home";
import type { Route } from "./+types/home.route";

export async function loader({ request }: Route.LoaderArgs) {
  if (process.env.OPEN_SIGNUP !== "true") return redirect("/projects");

  const user = await getSessionUser({ request });
  const billingEnabled = isBillingEnabled();
  if (!user)
    return { billingEnabled, initialCredits: getInitialCreditsAmount() };

  return { billingEnabled, initialCredits: getInitialCreditsAmount() };
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return (
    <Home
      billingEnabled={loaderData.billingEnabled}
      initialCredits={loaderData.initialCredits}
    />
  );
}
