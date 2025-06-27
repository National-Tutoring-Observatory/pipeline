import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dayjs from "dayjs";
import map from 'lodash/map';
import { EllipsisVertical } from "lucide-react";
import { Link } from "react-router";

export default function ProjectFiles({ files }: { files: any }) {
  return (
    <div className="mt-8">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>File type</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {map(files, (project) => {
              return (
                <TableRow key={project._id}>
                  <TableCell className="font-medium">
                    <Link to={`/projects/${project._id}`}>
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>{dayjs(project.createdAt).format('ddd, MMM D, YYYY - h:mm A')}</TableCell>
                  <TableCell>{project.fileType}</TableCell>
                  <TableCell className="text-right flex justify-end">
                    {/* <DropdownMenu>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => onDeleteProjectButtonClicked(project)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> */}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}