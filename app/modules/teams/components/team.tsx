import { Button } from "@/components/ui/button";
import {
  PageHeader,
  PageHeaderLeft,
  PageHeaderRight,
} from "@/components/ui/pageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import useTeamAuthorization from "../hooks/useTeamAuthorization";
import type { Team } from "../teams.types";

interface TeamProps {
  team: Team;
  breadcrumbs: Breadcrumb[];
  onEditTeamButtonClicked: (team: Team) => void;
}

export default function Team({
  team,
  breadcrumbs,
  onEditTeamButtonClicked,
}: TeamProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { canUpdate } = useTeamAuthorization(team._id);

  const parts = location.pathname.split("/").filter(Boolean);
  // Expect path like /teams/:id(/projects|prompts|users)
  const last = parts[parts.length - 1];
  const active = ["projects", "prompts", "users"].includes(last)
    ? last
    : "users";

  const handleTabChange = (value: string) => {
    navigate(`/teams/${team._id}/${value}`);
  };

  return (
    <div className="max-w-6xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
        <PageHeaderRight>
          {canUpdate && (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => onEditTeamButtonClicked(team)}
            >
              <Pencil />
              Edit
            </Button>
          )}
        </PageHeaderRight>
      </PageHeader>
      <Tabs value={active} onValueChange={handleTabChange} className="mb-2">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
        </TabsList>
      </Tabs>

      <Outlet
        context={{
          team,
        }}
      />
    </div>
  );
}
