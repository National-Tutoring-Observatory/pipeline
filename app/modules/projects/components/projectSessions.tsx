import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dayjs from "dayjs";
import map from 'lodash/map';
import type { Session } from "~/modules/sessions/sessions.types";
import type { Project } from "../projects.types";

export default function ProjectSessions({
  project,
  sessions,
  onSessionClicked,
  onReRunClicked
}: { project: Project, sessions: Session[], onSessionClicked: (session: Session) => void, onReRunClicked: () => void }) {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-end">
        <div className="text-xs text-muted-foreground">Sessions</div>
        {(project.hasErrored && !project.isConvertingFiles) && (
          <Button onClick={onReRunClicked}>Re-run errored</Button>
        )}
      </div>
      <div className="border rounded-md mt-2">
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
                    {(session.hasConverted) && (
                      <span className=" cursor-pointer" onClick={() => onSessionClicked(session)}>
                        {session.name}
                      </span>

                    ) || (
                        session.name
                      )}
                  </TableCell>
                  <TableCell>{dayjs(session.createdAt).format('ddd, MMM D, YYYY - h:mm A')}</TableCell>
                  <TableCell>{session.fileType}</TableCell>
                  <TableCell>{session.hasConverted === true ? "Converted" : session.hasErrored ? "Errored" : "Not converted"}</TableCell>
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
