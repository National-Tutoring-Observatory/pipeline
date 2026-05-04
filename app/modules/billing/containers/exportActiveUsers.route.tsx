import { redirect } from "react-router";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import { userIsSuperAdmin } from "~/modules/authorization/helpers/superAdmin";
import { TeamBillingService } from "../teamBilling";
import { TeamBillingBalanceService } from "../teamBillingBalance";

import type { Route } from "./+types/exportActiveUsers.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAuth({ request });

  if (!userIsSuperAdmin(user)) {
    return redirect("/");
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
    sort: "-totalBilledCosts",
    filters: { minSpend: "5" },
  });

  const query = buildQueryFromParams({
    match: {},
    queryParams,
    searchableFields: [],
    sortableFields: ["totalBilledCosts"],
    filterableFields: [
      {
        minSpend: (value: string) => {
          const amount = Number(value);
          if (isNaN(amount) || amount <= 0) return null;
          return { totalBilledCosts: { $gt: amount } };
        },
      },
    ],
  });

  const count = await TeamBillingBalanceService.count({
    totalBilledCosts: { $gt: 0 },
    ...query.match,
  });
  const result = await TeamBillingService.paginateActiveTeams(
    { ...query, page: 1 },
    count || 1,
  );
  const date = new Date().toISOString().split("T")[0];

  return new Response(TeamBillingService.activeTeamsToCSV(result.data), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="active-teams-${date}.csv"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
