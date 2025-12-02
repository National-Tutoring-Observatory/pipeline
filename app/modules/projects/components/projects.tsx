import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import map from 'lodash/map';
import { Link } from "react-router";

import Collection from "@/components/ui/collection";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import dayjs from 'dayjs';
import { EllipsisVertical, Users } from "lucide-react";
import Flag from "~/modules/featureFlags/components/flag";
import type { Project } from "../projects.types";

interface ProjectsProps {
  projects: Project[];
  onCreateProjectButtonClicked: () => void;
  onEditProjectButtonClicked: (project: Project) => void;
  onDeleteProjectButtonClicked: (project: Project) => void;
}

export default function Projects({
  projects,
  onCreateProjectButtonClicked,
  onEditProjectButtonClicked,
  onDeleteProjectButtonClicked
}: ProjectsProps) {
  return (
    <div className="max-w-6xl p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        Projects
      </h1>
      {(projects.length === 0) && (
        <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
          No projects created
          <div className="mt-3">
            <Button onClick={onCreateProjectButtonClicked}>Create project</Button>
          </div>
        </div>
      )}
      <Flag flag="HAS_COLLECTION_UI" >
        <Collection
          items={projects}
          getItemAttributes={(item) => {
            let teamName = '';
            if (item.team && typeof item.team === 'object' && 'name' in item.team && item.team.name) {
              teamName = item.team.name;
            }
            return {
              id: item._id,
              title: item.name,
              to: `/projects/${item._id}`,
              meta: [{
                icon: <Users />,
                text: teamName,
              }, {
                text: `Created at - ${dayjs(item.createdAt).format('ddd, MMM D, YYYY - h:mm A')}`,
              }]
            }
          }}
        />
      </Flag>
      {(projects.length > 0) && (
        <div className="border rounded-md">
          <div className="flex justify-end border-b p-2">
            <Button onClick={onCreateProjectButtonClicked}>Create project</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {map(projects, (project) => {
                let teamName = '';
                // @ts-ignore
                if (project.team && project.team?.name) {
                  // @ts-ignore
                  teamName = project.team.name;
                }
                const isDeleted = project.deleted === true;
                return (
                  <TableRow
                    key={project._id}
                    className={cn(isDeleted && 'bg-muted/60 opacity-60 pointer-events-none')}
                  >
                    <TableCell className="font-medium">
                      <Link
                        to={`/projects/${project._id}`}
                        className={cn('block w-full', isDeleted && 'pointer-events-none text-muted-foreground')}
                        tabIndex={isDeleted ? -1 : 0}
                        aria-disabled={isDeleted}
                      >
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell>{teamName}</TableCell>
                    <TableCell>{dayjs(project.createdAt).format('ddd, MMM D, YYYY - h:mm A')}</TableCell>
                    <TableCell className="text-right flex justify-end">
                      {isDeleted ? (
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800 border border-yellow-200 mr-2">Pending Deletion</span>
                      ) : null}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                            disabled={isDeleted}
                            tabIndex={isDeleted ? -1 : 0}
                            aria-disabled={isDeleted}
                          >
                            <EllipsisVertical />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem onClick={() => onEditProjectButtonClicked(project)} disabled={isDeleted} aria-disabled={isDeleted}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => onDeleteProjectButtonClicked(project)} disabled={isDeleted} aria-disabled={isDeleted}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
