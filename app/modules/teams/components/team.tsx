import { Button } from "@/components/ui/button";
import {
  PageHeader,
  PageHeaderLeft,
  PageHeaderRight,
} from "@/components/ui/pageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil } from "lucide-react";
import { useContext } from "react";
import { Link, Outlet, useLocation } from "react-router";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import { AuthenticationContext } from "~/modules/authentication/authentication.context";
import type { User } from "~/modules/users/users.types";
import TeamAuthorization from "../authorization";
import type { Team } from "../teams.types";

interface TeamProps {
  team: Team;
  breadcrumbs: Breadcrumb[];
  canViewBilling: boolean;
  onEditTeamButtonClicked: (team: Team) => void;
}

export default function Team({
  team,
  breadcrumbs,
  canViewBilling,
  onEditTeamButtonClicked,
}: TeamProps) {
  const location = useLocation();
  const user = useContext(AuthenticationContext) as User | null;
  const canUpdate = TeamAuthorization.canUpdate(user, team._id);

  const parts = location.pathname.split("/").filter(Boolean);
  const tabs = ["projects", "prompts", "users", "invite-links", "billing"];
  const active = parts.find((part) => tabs.includes(part)) ?? "users";

  return (
    <div className="max-w-7xl p-8">
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
      <Tabs value={active} className="mb-2">
        <TabsList>
          <TabsTrigger value="users" asChild>
            <Link to={`/teams/${team._id}/users`}>Users</Link>
          </TabsTrigger>
          <TabsTrigger value="invite-links" asChild>
            <Link to={`/teams/${team._id}/invite-links`}>Invite links</Link>
          </TabsTrigger>
          <TabsTrigger value="projects" asChild>
            <Link to={`/teams/${team._id}/projects`}>Projects</Link>
          </TabsTrigger>
          <TabsTrigger value="prompts" asChild>
            <Link to={`/teams/${team._id}/prompts`}>Prompts</Link>
          </TabsTrigger>
          {canViewBilling && (
            <TabsTrigger value="billing" asChild>
              <Link to={`/teams/${team._id}/billing`}>Billing</Link>
            </TabsTrigger>
          )}
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
