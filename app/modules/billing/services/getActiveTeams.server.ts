import { json2csv } from "json-2-csv";
import type { Query } from "~/modules/app/helpers/buildQueryFromParams";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import { TeamBillingBalanceService } from "../teamBillingBalance";

export interface ActiveTeamRow {
  teamId: string;
  teamName: string;
  contactName: string;
  contactEmail: string;
  institution: string;
  totalBilledCosts: number;
}

async function resolveRows(
  balances: { team: string; totalBilledCosts: number }[],
): Promise<ActiveTeamRow[]> {
  const teamIds = balances.map((b) => b.team);
  const teams = await TeamService.find({ match: { _id: { $in: teamIds } } });
  const teamMap = new Map(teams.map((t) => [t._id, t]));

  const ownerIds = [
    ...new Set(
      teams
        .map((t) => t.billingUser || t.createdBy)
        .filter((id): id is string => !!id),
    ),
  ];
  const owners = await UserService.find({
    match: { _id: { $in: ownerIds } },
  });
  const ownerMap = new Map(owners.map((u) => [u._id, u]));

  return balances.map((balance) => {
    const team = teamMap.get(balance.team);
    const ownerId = team?.billingUser || team?.createdBy;
    const owner = ownerId ? ownerMap.get(ownerId) : null;

    return {
      teamId: balance.team,
      teamName: team?.name || "Unknown",
      contactName: owner?.name || owner?.username || "--",
      contactEmail: owner?.email || "--",
      institution: owner?.institution || "--",
      totalBilledCosts: balance.totalBilledCosts,
    };
  });
}

export async function paginateActiveTeams(
  query: Query,
  pageSize?: number,
): Promise<{
  data: ActiveTeamRow[];
  count: number;
  totalPages: number;
}> {
  const result = await TeamBillingBalanceService.paginate({
    match: { totalBilledCosts: { $gt: 0 }, ...query.match },
    sort: query.sort,
    page: query.page,
    pageSize,
  });

  const rows = await resolveRows(result.data);

  return { data: rows, count: result.count, totalPages: result.totalPages };
}

export function activeTeamsToCSV(rows: ActiveTeamRow[]): string {
  const sanitize = (v: string) => (/^[=+\-@]/.test(v) ? `\t${v}` : v);
  return json2csv(
    rows.map((r) => ({
      Team: sanitize(r.teamName),
      Contact: sanitize(r.contactName),
      Email: sanitize(r.contactEmail),
      Institution: sanitize(r.institution),
      "Total Spend": `$${r.totalBilledCosts.toFixed(2)}`,
    })),
  );
}
