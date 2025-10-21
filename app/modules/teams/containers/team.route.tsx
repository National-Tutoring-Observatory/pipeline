
import type { Team as TeamType } from "../teams.types";
import Team from '../components/team';
import { useContext, useEffect } from "react";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import type { Route } from "./+types/team.route";
import type { Project } from "~/modules/projects/projects.types";
import CreateProjectDialog from "~/modules/projects/components/createProjectDialog";
import addDialog from "~/modules/dialogs/addDialog";
import { redirect, useFetcher, useSubmit } from "react-router";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { AuthenticationContext } from "~/modules/authentication/containers/authentication.container";
import type { User } from "~/modules/users/users.types";
import AddUserToTeamDialogContainer from './addUserToTeamDialog.container'
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import find from 'lodash/find';
import type { Prompt } from "~/modules/prompts/prompts.types";
import CreatePromptDialog from "~/modules/prompts/components/createPromptDialog";
import InviteUserToTeamDialogContainer from "./inviteUserToTeamDialogContainer";
import getUserRoleInTeam from "../helpers/getUserRoleInTeam";

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();

  const userSession = await getSessionUser({ request }) as User;

  if (!userSession) {
    return redirect('/');
  }

  if (userSession.role !== 'SUPER_ADMIN') {
    const hasTeamMatch = find(userSession.teams, (team) => {
      if (team.team === params.id && team.role === 'ADMIN') {
        return team;
      }
    })
    if (!hasTeamMatch) {
      return redirect('/');
    }
  }

  const team = await documents.getDocument({ collection: 'teams', match: { _id: params.id } }) as { data: TeamType };


  const projects = await documents.getDocuments({ collection: 'projects', match: { team: team.data._id } }) as { data: Project };
  const prompts = await documents.getDocuments({ collection: 'prompts', match: { team: team.data._id } }) as { data: Prompt };
  const users = await documents.getDocuments({ collection: 'users', match: { "teams.team": team.data._id } }) as { data: TeamType };
  return { team, projects, prompts, users };
}

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, payload = {} } = await request.json()

  const { userIds } = payload;

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'ADD_USERS_TO_TEAM':

      for (const userId of userIds) {
        const user = await documents.getDocument({ collection: 'users', match: { _id: userId } }) as { data: User };

        if (user.data) {
          if (!user.data.teams) {
            user.data.teams = [];
          }
          user.data.teams.push({
            team: params.id,
            role: 'ADMIN'
          });
          await documents.updateDocument({ collection: 'users', match: { _id: userId }, update: { teams: user.data.teams } });
        }
      }
      return {};
    default:
      return {};
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function TeamRoute({ loaderData }: {
  loaderData: {
    team: { data: TeamType },
    projects: { data: Project[] },
    users: { data: User[] },
    prompts: { data: Prompt[] }
  }
}) {
  const { team, projects, prompts, users } = loaderData;

  const fetcher = useFetcher();
  const submit = useSubmit();
  const authentication = useContext(AuthenticationContext) as User | null;

  const onCreateProjectButtonClicked = () => {
    addDialog(
      <CreateProjectDialog
        hasTeamSelection={false}
        onCreateNewProjectClicked={onCreateNewProjectClicked}
      />
    );
  }

  const onCreateNewProjectClicked = ({ name }: { name: string }) => {
    fetcher.submit({ intent: 'CREATE_PROJECT', payload: { name, team: team.data._id } }, {
      action: "/api/projects",
      method: "post",
      encType: "application/json"
    });
  }

  const onCreatePromptButtonClicked = () => {
    addDialog(
      <CreatePromptDialog
        hasTeamSelection={false}
        onCreateNewPromptClicked={onCreateNewPromptClicked}
      />
    );
  }

  const onCreateNewPromptClicked = ({ name, annotationType, }: { name: string, annotationType: string, }) => {
    fetcher.submit({ intent: 'CREATE_PROMPT', payload: { name, annotationType, team: team.data._id } }, {
      action: "/api/prompts",
      method: "post",
      encType: "application/json"
    });
  }

  const onAddUsersClicked = (userIds: string[]) => {
    submit(JSON.stringify({ intent: 'ADD_USERS_TO_TEAM', payload: { userIds } }), { method: 'PUT', encType: 'application/json' });
  }

  const onAddUserToTeamButtonClicked = () => {
    addDialog(
      <AddUserToTeamDialogContainer
        teamId={team.data._id}
        onAddUsersClicked={onAddUsersClicked}
      />
    );
  }

  const onInviteUserToTeamButtonClicked = () => {
    addDialog(
      <InviteUserToTeamDialogContainer
        teamId={team.data._id}
      />
    );
  }

  useEffect(() => {
    updateBreadcrumb([{ text: 'Teams', link: `/teams` }, { text: team.data.name }])
  }, []);

  let canCreateProjects = false;
  let canCreatePrompts = false;

  if (authentication) {
    const {
      role
    } = getUserRoleInTeam({ user: authentication, team: team.data });
    if (role) {
      canCreateProjects = true;
      canCreatePrompts = true;
    }
  }


  return (
    <Team
      team={team.data}
      projects={projects.data}
      prompts={prompts.data}
      users={users.data}
      authentication={authentication}
      canCreateProjects={canCreateProjects}
      canCreatePrompts={canCreatePrompts}
      onCreateProjectButtonClicked={onCreateProjectButtonClicked}
      onCreatePromptButtonClicked={onCreatePromptButtonClicked}
      onAddUserToTeamClicked={onAddUserToTeamButtonClicked}
      onInviteUserToTeamClicked={onInviteUserToTeamButtonClicked}
    />
  );
}
