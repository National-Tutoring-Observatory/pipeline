import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CreateProjectDialog from "./createProjectDialog";
import map from 'lodash/map';
import { Link } from "react-router";

interface Project {
  _id: string;
  name: string;
  createdAt: string;
}

interface ProjectsProps {
  projects: Project[];
  onCreateNewProjectClicked: (name: string) => void;
  onDeleteProjectClicked: (projectId: string) => void;
}

export function Projects({
  projects,
  onCreateNewProjectClicked,
  onDeleteProjectClicked
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
            <CreateProjectDialog
              onCreateNewProjectClicked={onCreateNewProjectClicked}
            />
          </div>
        </div>
      )}
      {(projects.length > 0) && (
        <div className="border rounded-md">
          <div className="flex justify-end border-b p-2">
            <CreateProjectDialog
              onCreateNewProjectClicked={onCreateNewProjectClicked}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {map(projects, (project) => {
                return (
                  <TableRow key={project._id}>
                    <TableCell className="font-medium">
                      <Link to={`/projects/${project._id}`}>
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell>{project.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDeleteProjectClicked(project._id)}>
                        Delete
                      </Button>
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
