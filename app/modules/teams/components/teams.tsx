import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from 'dayjs';
import map from 'lodash/map';
import { EllipsisVertical } from "lucide-react";
import { Link } from "react-router";
import type { User } from "~/modules/users/users.types";
import type { Team } from "../teams.types";
import useTeamAuthorization from "../hooks/useTeamAuthorization";

interface TeamsProps {
  teams: Team[];
  authentication: User | null,
  onCreateTeamButtonClicked: () => void;
  onEditTeamButtonClicked: (team: Team) => void;
  onDeleteTeamButtonClicked: (team: Team) => void;
}

export default function Teams({
  teams,
  authentication,
  onCreateTeamButtonClicked,
  onEditTeamButtonClicked,
  onDeleteTeamButtonClicked
}: TeamsProps) {
  const { canCreate } = useTeamAuthorization();

  return (
    <div className="max-w-6xl p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        Teams
      </h1>
      {(teams.length === 0) && (
        <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
          No teams created
          <div className="mt-3">
            {canCreate && (
              <Button onClick={onCreateTeamButtonClicked}>Create team</Button>
            )}
          </div>
        </div>
      )}
      {(teams.length > 0) && (
        <div className="border rounded-md">
          <div className="flex justify-end border-b p-2">
            {canCreate && (
              <Button onClick={onCreateTeamButtonClicked}>Create team</Button>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {map(teams, (team) => {
                const { canUpdate, canDelete } = useTeamAuthorization(team._id);
                return (
                  <TableRow key={team._id}>
                    <TableCell className="font-medium">
                      <Link to={`/teams/${team._id}`} className="block w-full">
                        {team.name}
                      </Link>
                    </TableCell>
                    <TableCell>{dayjs(team.createdAt).format('ddd, MMM D, YYYY - h:mm A')}</TableCell>
                    <TableCell className="text-right flex justify-end">
                      {(canUpdate || canDelete) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                              size="icon"
                            >
                              <EllipsisVertical />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            {canUpdate && (
                              <DropdownMenuItem onClick={() => onEditTeamButtonClicked(team)}>
                                Edit
                              </DropdownMenuItem>
                            )}
                            {/* <DropdownMenuItem>Make a copy</DropdownMenuItem>
                            <DropdownMenuItem>Favorite</DropdownMenuItem> */}
                            {canDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={() => onDeleteTeamButtonClicked(team)}>
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
