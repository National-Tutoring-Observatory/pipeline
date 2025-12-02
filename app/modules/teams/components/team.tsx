import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Outlet, useLocation, useNavigate } from "react-router";
import type { User } from "~/modules/users/users.types";
import type { Team } from "../teams.types";


interface TeamProps {
  team: Team;
  authentication: User | null;
  canCreateProjects: boolean;
  canCreatePrompts: boolean;
  onCreateProjectButtonClicked: () => void;
  onCreatePromptButtonClicked: () => void;
  onAddUserToTeamClicked: () => void;
  onInviteUserToTeamClicked: () => void;
  onRemoveUserFromTeamClicked: (userId: string) => void;
}

export default function Team({
  team,
  authentication,
  canCreateProjects,
  canCreatePrompts,
  onCreateProjectButtonClicked,
  onCreatePromptButtonClicked,
  onAddUserToTeamClicked,
  onInviteUserToTeamClicked,
  onRemoveUserFromTeamClicked
}: TeamProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const parts = location.pathname.split('/').filter(Boolean);
  // Expect path like /teams/:id(/projects|prompts|users)
  const last = parts[parts.length - 1];
  const active = ['projects', 'prompts', 'users'].includes(last) ? last : 'projects';

  const handleTabChange = (value: string) => {
    navigate(`/teams/${team._id}/${value}`);
  };

  return (
    <div className="p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-4">
        {team.name}
      </h1>
      <Tabs value={active} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
      </Tabs>

      <Outlet context={{
        team,
        authentication,
        canCreateProjects,
        canCreatePrompts,
        onCreateProjectButtonClicked,
        onCreatePromptButtonClicked,
        onAddUserToTeamClicked,
        onInviteUserToTeamClicked,
        onRemoveUserFromTeamClicked
      }} />
    </div>
  );
}
