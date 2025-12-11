import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import type { Team } from "../teams.types";
import useTeamAuthorization from "../hooks/useTeamAuthorization";


interface TeamProps {
  team: Team;
  onEditTeamButtonClicked: (team: Team) => void;
}

export default function Team({
  team,
  onEditTeamButtonClicked
}: TeamProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { canUpdate } = useTeamAuthorization(team._id);

  const parts = location.pathname.split('/').filter(Boolean);
  // Expect path like /teams/:id(/projects|prompts|users)
  const last = parts[parts.length - 1];
  const active = ['projects', 'prompts', 'users'].includes(last) ? last : 'users';

  const handleTabChange = (value: string) => {
    navigate(`/teams/${team._id}/${value}`);
  };

  return (
    <div className="p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          {team.name}
        </h1>
        {canUpdate && (
          <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => onEditTeamButtonClicked(team)}>
            <Pencil />
            Edit
          </Button>
        )}
      </div>
      <Tabs value={active} onValueChange={handleTabChange} className="mb-2">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
        </TabsList>
      </Tabs>

      <Outlet context={{
        team,
      }} />
    </div>
  );
}
