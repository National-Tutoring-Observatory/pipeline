import { redirect } from "react-router";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import { userIsSuperAdmin } from "~/modules/authorization/helpers/superAdmin";
import BillingLayout from "../components/billingLayout";

import type { Route } from "./+types/billingLayout.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAuth({ request });

  if (!userIsSuperAdmin(user)) {
    return redirect("/");
  }

  return {};
}

export default function BillingLayoutRoute() {
  return <BillingLayout />;
}
