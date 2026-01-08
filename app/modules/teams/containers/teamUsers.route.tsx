import find from 'lodash/find';
import { useEffect } from "react";
import { redirect, useLoaderData, useOutletContext, useParams, useSubmit } from "react-router";
import buildQueryFromParams from '~/modules/app/helpers/buildQueryFromParams';
import getQueryParamsFromRequest from '~/modules/app/helpers/getQueryParamsFromRequest.server';
import { useSearchQueryParams } from '~/modules/app/hooks/useSearchQueryParams';
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import TeamAuthorization from "../authorization";
import ConfirmRemoveUserDialog from "../components/confirmRemoveUserDialog";
import TeamUsers from "../components/teamUsers";
import { addSuperAdminToTeam } from '../services/teamUsers.server';
import type { TeamAssignmentOption } from "../teams.types";
import { isTeamAssignmentOption } from "../teams.types";
import type { Route } from "./+types/teamUsers.route";
import AddSuperAdminToTeamDialogContainer from "./addSuperAdminToTeamDialogContainer";
import AddUserToTeamDialogContainer from './addUserToTeamDialog.container';
import InviteUserToTeamDialogContainer from "./inviteUserToTeamDialogContainer";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (!user) {
    return redirect('/');
  }
  if (!TeamAuthorization.Users.canView(user, params.id)) {
    return redirect('/');
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: '',
    currentPage: 1,
    sort: 'username',
    filters: {}
  });

  const query = buildQueryFromParams({
    match: { "teams.team": params.id },
    queryParams,
    searchableFields: ['username'],
    sortableFields: ['username', 'createdAt'],
    filterableFields: []
  });

  const documents = getDocumentsAdapter();
  const result = await documents.getDocuments<User>({ collection: 'users', ...query });
  return { users: result };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { intent, payload = {} } = await request.json();
  const { userIds, userId } = payload;

  const user = await getSessionUser({ request }) as User | null;
  if (!user) return redirect('/');

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'ADD_SUPERADMIN_TO_TEAM': {
      if (!TeamAuthorization.Users.canRequestAccess(user, params.id)) {
        throw new Error('Only super admins can add super admins to teams.');
      }
      const { reason, option } = payload;
      if (!isTeamAssignmentOption(option)) {
        throw new Error('Invalid team assignment option');
      }
      await addSuperAdminToTeam({ teamId: params.id, userId: user._id, reason: reason, option: option });
      return {};
    }
    case 'ADD_USERS_TO_TEAM':
      if (!TeamAuthorization.Users.canUpdate(user, params.id)) {
        throw new Error('You do not have permission to manage team users.');
      }
      for (const id of userIds) {
        const userDoc = await documents.getDocument<User>({ collection: 'users', match: { _id: id } });
        if (userDoc.data) {
          if (!userDoc.data.teams) userDoc.data.teams = [];
          userDoc.data.teams.push({ team: params.id, role: 'ADMIN' });
          await documents.updateDocument({ collection: 'users', match: { _id: id }, update: { teams: userDoc.data.teams } });
        }
      }
      return {};
    case 'REMOVE_USER_FROM_TEAM':
      if (!TeamAuthorization.Users.canUpdate(user, params.id)) {
        throw new Error('You do not have permission to manage team users.');
      }
      if (!userId) return {};
      const userDoc = await documents.getDocument<User>({ collection: 'users', match: { _id: userId } });
      if (userDoc.data && Array.isArray(userDoc.data.teams)) {
        userDoc.data.teams = userDoc.data.teams.filter(t => t.team !== params.id);
        await documents.updateDocument({ collection: 'users', match: { _id: userId }, update: { teams: userDoc.data.teams } });
      }
      return {};
    default:
      return {};
  }
}

export default function TeamUsersRoute() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();
  const ctx = useOutletContext<any>();
  const submit = useSubmit();

  const {
    searchValue, setSearchValue,
    currentPage, setCurrentPage,
    sortValue, setSortValue,
    filtersValues, setFiltersValues,
    isSyncing
  } = useSearchQueryParams({
    searchValue: '',
    currentPage: 1,
    sortValue: 'username',
    filters: {}
  });

  const onAddUsersClicked = (userIds: string[]) => {
    submit(JSON.stringify({ intent: 'ADD_USERS_TO_TEAM', payload: { userIds } }), { method: 'PUT', encType: 'application/json' });
  }

  const onAddSuperAdminClicked = (reason: string, option: TeamAssignmentOption) => {
    submit(JSON.stringify({ intent: 'ADD_SUPERADMIN_TO_TEAM', payload: { reason, option } }), { method: 'PUT', encType: 'application/json' });
  }

  const onAddSuperAdminToTeamButtonClicked = () => {
    addDialog(
      <AddSuperAdminToTeamDialogContainer
        onAddSuperAdminClicked={onAddSuperAdminClicked}
      />
    );
  }

  const onAddUserToTeamButtonClicked = () => {
    addDialog(
      <AddUserToTeamDialogContainer
        teamId={ctx.team._id}
        onAddUsersClicked={onAddUsersClicked}
      />
    );
  }

  const onInviteUserToTeamButtonClicked = () => {
    addDialog(
      <InviteUserToTeamDialogContainer
        teamId={ctx.team._id}
      />
    );
  }

  const onRemoveUserFromTeamClicked = (userId: string) => {
    addDialog(
      <ConfirmRemoveUserDialog onConfirm={() => {
        submit(JSON.stringify({ intent: 'REMOVE_USER_FROM_TEAM', payload: { userId } }), { method: 'PUT', encType: 'application/json' });
      }} />
    );
  }

  const onActionClicked = (action: string) => {
    switch (action) {
      case 'REQUEST_ACCESS':
        onAddSuperAdminToTeamButtonClicked();
        break;
      case 'ADD_USER':
        onAddUserToTeamButtonClicked();
        break;
      case 'INVITE_USER':
        onInviteUserToTeamButtonClicked();
        break;
    }
  }

  const onItemActionClicked = ({ id, action }: { id: string, action: string }) => {
    const user = find(data.users.data, { _id: id });
    if (!user) return null;
    switch (action) {
      case 'REMOVE':
        onRemoveUserFromTeamClicked(user._id);
        break;
    }
  }

  const onSearchValueChanged = (searchValue: string) => {
    setSearchValue(searchValue);
  }

  const onPaginationChanged = (currentPage: number) => {
    setCurrentPage(currentPage);
  }

  const onFiltersValueChanged = (filterValue: any) => {
    setFiltersValues({ ...filtersValues, ...filterValue });
  }

  const onSortValueChanged = (sortValue: string) => {
    setSortValue(sortValue);
  }

  useEffect(() => {
    updateBreadcrumb([
      { text: 'Teams', link: '/teams' },
      { text: ctx.team.name, link: `/teams/${params.id}` },
      { text: 'Users' }
    ]);
  }, [params.id]);

  const users = data.users.data ?? [];

  return (
    <TeamUsers
      users={users}
      team={ctx.team}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={data.users.totalPages}
      filtersValues={filtersValues}
      sortValue={sortValue}
      isSyncing={isSyncing}
      onActionClicked={onActionClicked}
      onItemActionClicked={onItemActionClicked}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
      onFiltersValueChanged={onFiltersValueChanged}
      onSortValueChanged={onSortValueChanged}
      onAddUserToTeamButtonClicked={onAddUserToTeamButtonClicked}
      onAddSuperAdminToTeamButtonClicked={onAddSuperAdminToTeamButtonClicked}
      onInviteUserToTeamButtonClicked={onInviteUserToTeamButtonClicked}
      onRemoveUserFromTeamClicked={onRemoveUserFromTeamClicked}
    />
  );
}
