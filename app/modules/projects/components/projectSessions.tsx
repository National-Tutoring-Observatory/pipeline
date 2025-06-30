import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dayjs from "dayjs";
import map from 'lodash/map';
import { EllipsisVertical } from "lucide-react";
import { Link } from "react-router";
import type { Session } from "~/modules/sessions/sessions.types";

export default function ProjectFiles({ sessions }: { sessions: Session[] }) {
  return (
    <div className="mt-8">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>File type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {map(sessions, (session) => {
              return (
                <TableRow key={session._id}>
                  <TableCell className="font-medium">
                    <Link to={`/projects/${session._id}`}>
                      {session.name}
                    </Link>
                  </TableCell>
                  <TableCell>{dayjs(session.createdAt).format('ddd, MMM D, YYYY - h:mm A')}</TableCell>
                  <TableCell>{session.fileType}</TableCell>
                  <TableCell>{session.hasConverted === true ? "Converted" : "Not converted"}</TableCell>
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