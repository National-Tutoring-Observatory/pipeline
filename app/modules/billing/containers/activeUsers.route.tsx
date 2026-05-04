import { redirect } from "react-router";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import { userIsSuperAdmin } from "~/modules/authorization/helpers/superAdmin";
import ActiveUsersTable from "../components/activeUsers";
import { TeamBillingService } from "../teamBilling";

import type { Route } from "./+types/activeUsers.route";

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

  const activeUsers = await TeamBillingService.paginateActiveTeams(query);

  return { activeUsers };
}

export default function ActiveUsersRoute({ loaderData }: Route.ComponentProps) {
  const { activeUsers } = loaderData ?? {};

  const {
    currentPage,
    setCurrentPage,
    sortValue,
    setSortValue,
    filtersValues,
    setFiltersValues,
    isSyncing,
  } = useSearchQueryParams({
    searchValue: "",
    currentPage: 1,
    sortValue: "-totalBilledCosts",
    filters: { minSpend: "5" },
  });

  return (
    <ActiveUsersTable
      rows={activeUsers?.data ?? []}
      totalPages={activeUsers?.totalPages ?? 1}
      currentPage={currentPage}
      sortValue={sortValue}
      filtersValues={filtersValues}
      isSyncing={isSyncing}
      onPaginationChanged={setCurrentPage}
      onSortValueChanged={setSortValue}
      onFiltersValueChanged={setFiltersValues}
    />
  );
}
