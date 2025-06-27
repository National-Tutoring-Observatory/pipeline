import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import map from 'lodash/map';
import { Link } from "react-router";

import type { Project } from "../projects.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import dayjs from 'dayjs'

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
    <div className="max-w-5xl mx-auto p-8">
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
      {(projects.length > 0) && (
        <div className="border rounded-md">
          <div className="flex justify-end border-b p-2">
            <Button onClick={onCreateProjectButtonClicked}>Create project</Button>
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
              {map(projects, (project) => {
                return (
                  <TableRow key={project._id}>
                    <Link to={`/projects/${project._id}`} className="block w-full">
                      <TableCell className="font-medium">
                        {project.name}
                      </TableCell>
                    </Link>
                    <TableCell>{dayjs(project.createdAt).format('ddd, MMM D, YYYY - h:mm A')}</TableCell>
                    <TableCell className="text-right flex justify-end">
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
                          <DropdownMenuItem onClick={() => onEditProjectButtonClicked(project)}>
                            Edit
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem>Make a copy</DropdownMenuItem>
                          <DropdownMenuItem>Favorite</DropdownMenuItem> */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => onDeleteProjectButtonClicked(project)}>
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
