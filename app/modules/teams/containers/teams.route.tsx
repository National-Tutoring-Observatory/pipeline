import find from "lodash/find";
import map from "lodash/map";
import { useEffect } from "react";
import { data, redirect, useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import type { User } from "~/modules/users/users.types";
import TeamAuthorization from "../authorization";
import CreateTeamDialog from "../components/createTeamDialog";
import EditTeamDialog from "../components/editTeamDialog";
import Teams from "../components/teams";
import { TeamService } from "../team";
import type { Team } from "../teams.types";
import type { Route } from "./+types/teams.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  let match = {};

  const userSession = (await getSessionUser({ request })) as User;

  if (!userSession) {
    return redirect("/");
  }

  if (userSession.role === "SUPER_ADMIN") {
    match = {};
  } else {
    const teamIds = map(userSession.teams, "team");
    match = { _id: { $in: teamIds } };
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
    sort: "name",
    filters: {},
  });

  const query = buildQueryFromParams({
    match,
    queryParams,
    searchableFields: ["name"],
    sortableFields: ["name", "createdAt"],
    filterableFields: [],
  });

  const teams = await TeamService.paginate({
    match: query.match,
    sort: query.sort,
    page: query.page,
  });

  return { teams };
}

export async function action({ request }: Route.ActionArgs) {
  const { intent, entityId, payload = {} } = await request.json();

  const { name } = payload;

  const user = (await getSessionUser({ request })) as User;

  if (!user) {
    return redirect("/");
  }

  switch (intent) {
    case "CREATE_TEAM":
      if (!TeamAuthorization.canCreate(user)) {
        return data(
          {
            errors: {
              general:
                "Insufficient permissions. Only super admins can create teams.",
            },
          },
          { status: 403 },
        );
      }
      if (typeof name !== "string") {
        return data(
          {
            errors: {
              general: "Team name is required and must be a string.",
            },
          },
          { status: 400 },
        );
      }
      const team = await TeamService.create({ name });
      return data({
        success: true,
        intent: "CREATE_TEAM",
        data: team,
      });
    case "UPDATE_TEAM":
      if (!TeamAuthorization.canUpdate(user, entityId)) {
        return data(
          {
            errors: {
              general:
                "Insufficient permissions. Only team admins can update teams.",
            },
          },
          { status: 403 },
        );
      }
      const updated = await TeamService.updateById(entityId, { name });
      return data({
        success: true,
        intent: "UPDATE_TEAM",
        data: updated,
      });
    default:
      return data({ errors: { general: "Invalid intent" } }, { status: 400 });
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function TeamsRoute({ loaderData }: Route.ComponentProps) {
  const { teams } = loaderData;
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const {
    searchValue,
    setSearchValue,
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
    sortValue: "name",
    filters: {},
  });

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success && fetcher.data.intent === "CREATE_TEAM") {
        toast.success("Team created");
        navigate(`/teams/${fetcher.data.data._id}/users`);
      } else if (
        fetcher.data.success &&
        fetcher.data.intent === "UPDATE_TEAM"
      ) {
        toast.success("Team updated");
        addDialog(null);
      } else if (fetcher.data.errors) {
        toast.error(fetcher.data.errors.general || "An error occurred");
      }
    }
  }, [fetcher.state, fetcher.data, navigate]);

  const breadcrumbs = [{ text: "Teams" }];

  const openCreateTeamDialog = () => {
    addDialog(<CreateTeamDialog onCreateNewTeamClicked={submitCreateTeam} />);
  };

  const openEditTeamDialog = (team: Team) => {
    addDialog(
      <EditTeamDialog team={team} onEditTeamClicked={submitEditTeam} />,
    );
  };

  const submitCreateTeam = (name: string) => {
    fetcher.submit(
      JSON.stringify({ intent: "CREATE_TEAM", payload: { name } }),
      {
        method: "POST",
        encType: "application/json",
      },
    );
  };

  const submitEditTeam = (team: Team) => {
    fetcher.submit(
      JSON.stringify({
        intent: "UPDATE_TEAM",
        entityId: team._id,
        payload: { name: team.name },
      }),
      { method: "PUT", encType: "application/json" },
    );
  };

  const onActionClicked = (action: String) => {
    if (action === "CREATE") {
      openCreateTeamDialog();
    }
  };

  const onItemActionClicked = ({
    id,
    action,
  }: {
    id: string;
    action: string;
  }) => {
    const team = find(teams.data, { _id: id }) as Team | undefined;
    if (!team) return null;
    switch (action) {
      case "EDIT":
        openEditTeamDialog(team);
        break;
    }
  };

  const onSearchValueChanged = (searchValue: string) => {
    setSearchValue(searchValue);
  };

  const onPaginationChanged = (currentPage: number) => {
    setCurrentPage(currentPage);
  };

  const onFiltersValueChanged = (filterValue: any) => {
    setFiltersValues({ ...filtersValues, ...filterValue });
  };

  const onSortValueChanged = (sortValue: string) => {
    setSortValue(sortValue);
  };

  return (
    <Teams
      teams={teams?.data}
      breadcrumbs={breadcrumbs}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={teams.totalPages}
      filtersValues={filtersValues}
      sortValue={sortValue}
      isSyncing={isSyncing}
      onActionClicked={onActionClicked}
      onItemActionClicked={onItemActionClicked}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
      onFiltersValueChanged={onFiltersValueChanged}
      onSortValueChanged={onSortValueChanged}
    />
  );
}
