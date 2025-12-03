import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Outlet, useLocation, useNavigate } from "react-router";
import type { Team } from "../teams.types";


interface TeamProps {
  team: Team;
}

export default function Team({
  team,
}: TeamProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const parts = location.pathname.split('/').filter(Boolean);
  // Expect path like /teams/:id(/projects|prompts|users)
  const last = parts[parts.length - 1];
  const active = ['projects', 'prompts', 'users'].includes(last) ? last : 'users';

  const handleTabChange = (value: string) => {
    navigate(`/teams/${team._id}/${value}`);
  };

  return (
    <div className="p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-4">
        {team.name}
      </h1>
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
