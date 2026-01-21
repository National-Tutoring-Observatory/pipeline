import find from "lodash/find";
import map from "lodash/map";
import { useEffect } from "react";
import { redirect, useActionData, useNavigate, useSubmit } from "react-router";
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

  const data = await TeamService.find({ match });

  return { teams: { data, totalPages: 1 } };
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
        throw new Error(
          "Insufficient permissions. Only super admins can create teams.",
        );
      }
      if (typeof name !== "string") {
        throw new Error("Team name is required and must be a string.");
      }
      const team = await TeamService.create({ name });
      return {
        intent: "CREATE_TEAM",
        data: team,
      };
    case "UPDATE_TEAM":
      if (!TeamAuthorization.canUpdate(user, entityId)) {
        throw new Error(
          "Insufficient permissions. Only team admins can update teams.",
        );
      }
      const updated = await TeamService.updateById(entityId, { name });
      return { data: updated };
    default:
      return {};
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function TeamsRoute({ loaderData }: Route.ComponentProps) {
  const { teams } = loaderData;
  const submit = useSubmit();
  const actionData = useActionData();
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
    if (actionData?.intent === "CREATE_TEAM") {
      navigate(`/teams/${actionData.data._id}`);
    }
  }, [actionData]);

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
    submit(JSON.stringify({ intent: "CREATE_TEAM", payload: { name } }), {
      method: "POST",
      encType: "application/json",
    });
  };

  const submitEditTeam = (team: Team) => {
    submit(
      JSON.stringify({
        intent: "UPDATE_TEAM",
        entityId: team._id,
        payload: { name: team.name },
      }),
      { method: "PUT", encType: "application/json" },
    ).then(() => {
      toast.success("Updated team");
    });
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
