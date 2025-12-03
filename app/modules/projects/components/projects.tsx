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
import find from 'lodash/find';
import get from 'lodash/get';
import { Edit, EllipsisVertical, FolderKanban, Trash2, Users } from "lucide-react";
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
          itemsLayout="list"
          actions={[{
            action: 'CREATE',
            text: 'Create project'
          }]}
          hasSearch
          hasPagination
          searchValue={""}
          currentPage={1}
          totalPages={2}
          emptyAttributes={{
            icon: <FolderKanban />,
            title: 'No Projects yet',
            description: "You haven't created any projects yet. Get started by creating your first project.",
            actions: [{
              action: 'CREATE',
              text: 'Create project'
            }]
          }}
          getItemAttributes={(item) => {

            const teamName = get(item, 'team.name', '');

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
          getItemActions={(item) => {
            return [{
              action: 'EDIT',
              icon: <Edit />,
              text: 'Edit'
            }, {
              action: 'DELETE',
              icon: <Trash2 />,
              text: 'Delete',
              variant: 'destructive'
            }]
          }}
          onActionClicked={(action) => {
            if (action === 'CREATE') {
              onCreateProjectButtonClicked();
            }
          }}
          onItemActionClicked={({ id, action }) => {
            const project = find(projects, { _id: id });
            if (!project) return null;
            switch (action) {
              case 'EDIT':
                onEditProjectButtonClicked(project);
                break;

              case 'DELETE':
                onDeleteProjectButtonClicked(project);
                break;
            }
          }}
          onSearchValueChanged={(searchValue) => {
            console.log(searchValue);
          }}
          onPaginationChanged={(currentPage) => {
            console.log(currentPage);
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
                const isDeleted = project.isDeleted === true;
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
