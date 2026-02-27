import { redirect, useLoaderData } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import hasFeatureFlag from "~/modules/featureFlags/helpers/hasFeatureFlag";
import type { BillingData } from "~/modules/llm/llmBilling.types";
import { getTeamBillingData } from "~/modules/llm/services/liteLLMBilling.server";
import TeamAuthorization from "../authorization";
import TeamBilling from "../components/teamBilling";
import type { Route } from "./+types/teamBilling.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (!user) return redirect("/");

  if (!TeamAuthorization.canView(user, params.id)) {
    return redirect("/");
  }

  const hasBilling = await hasFeatureFlag("HAS_BILLING", { request }, { defaultValue: false });
  if (!hasBilling) {
    return redirect(`/teams/${params.id}/users`);
  }

  if (process.env.LLM_PROVIDER !== "AI_GATEWAY") {
    return {
      billing: {
        tagSpend: null,
        error: "Billing data is only available when using AI Gateway",
      } satisfies BillingData,
    };
  }

  const billing = await getTeamBillingData(params.id);
  return { billing };
}

export default function TeamBillingRoute() {
  const { billing } = useLoaderData<typeof loader>();

  return <TeamBilling billing={billing} />;
}
