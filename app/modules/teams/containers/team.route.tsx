
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useContext, useEffect } from "react";
import { redirect, useFetcher, useSubmit } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import { AuthenticationContext } from "~/modules/authentication/containers/authentication.container";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import CreateProjectDialog from "~/modules/projects/components/createProjectDialog";
import type { Project } from "~/modules/projects/projects.types";
import CreatePromptDialog from "~/modules/prompts/components/createPromptDialog";
import type { Prompt } from "~/modules/prompts/prompts.types";
import type { User } from "~/modules/users/users.types";
import Team from '../components/team';
import getUserRoleInTeam from "../helpers/getUserRoleInTeam";
import { isTeamAdmin, validateTeamAdmin } from "../helpers/teamAdmin";
import type { Team as TeamType } from "../teams.types";
import type { Route } from "./+types/team.route";
import AddUserToTeamDialogContainer from './addUserToTeamDialog.container';
import InviteUserToTeamDialogContainer from "./inviteUserToTeamDialogContainer";

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();

  const userSession = await getSessionUser({ request }) as User;

  if (!userSession) {
    return redirect('/');
  }

  if (!(await isTeamAdmin({ user: userSession, teamId: params.id }))) {
    return redirect('/');
  }

  const team = await documents.getDocument({ collection: 'teams', match: { _id: params.id } }) as { data: TeamType };

  const projectsResult = await documents.getDocuments<Project>({ collection: 'projects', match: { team: team.data._id } });
  const projects = { data: projectsResult.data };
  const promptsResult = await documents.getDocuments<Prompt>({ collection: 'prompts', match: { team: team.data._id } });
  const prompts = { data: promptsResult.data };
  const teamsResult = await documents.getDocuments<User>({ collection: 'users', match: { "teams.team": team.data._id } });
  const users = { data: teamsResult.data };
  return { team, projects, prompts, users };
}

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, payload = {} } = await request.json()

  const { userIds, userId } = payload;

  const user = await getSessionUser({ request }) as User;

  if (!user) {
    return redirect('/');
  }

  await validateTeamAdmin({ user, teamId: params.id });

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
    case 'REMOVE_USER_FROM_TEAM':
      if (!userId) return {};
      const userDoc = await documents.getDocument({ collection: 'users', match: { _id: userId } }) as { data: User };
      if (userDoc.data && Array.isArray(userDoc.data.teams)) {
        userDoc.data.teams = userDoc.data.teams.filter(t => t.team !== params.id);
        await documents.updateDocument({ collection: 'users', match: { _id: userId }, update: { teams: userDoc.data.teams } });
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



  const onRemoveUserFromTeamClicked = (userId: string) => {
    addDialog(
      <ConfirmRemoveUserDialog
        onConfirm={() => {
          submit(
            JSON.stringify({ intent: 'REMOVE_USER_FROM_TEAM', payload: { userId } }),
            { method: 'PUT', encType: 'application/json' }
          );
        }}
      />
    );
  };

  function ConfirmRemoveUserDialog({ onConfirm }: { onConfirm: () => void }) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove user from team?</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this user from the team? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" variant="destructive" onClick={onConfirm}>
              Remove
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    );
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
      onRemoveUserFromTeamClicked={onRemoveUserFromTeamClicked}
    />
  );
}
