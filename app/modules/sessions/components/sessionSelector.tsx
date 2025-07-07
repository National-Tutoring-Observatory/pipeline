import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dayjs from "dayjs";
import map from 'lodash/map';
import type { Session } from "../sessions.types";
import { Checkbox } from "@/components/ui/checkbox";

export default function SessionSelector({
  sessions = [],
}) {
  return (
    <div>
      <div className="border rounded-md h-80 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"><Checkbox ></Checkbox></TableHead>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>File type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {map(sessions, (session: Session) => {
              return (
                <TableRow key={session._id}>
                  <TableCell className="w-8">
                    <Checkbox></Checkbox>
                  </TableCell>
                  <TableCell className="font-medium">
                    {session.name}
                  </TableCell>
                  <TableCell>{dayjs(session.createdAt).format('ddd, MMM D, YYYY - h:mm A')}</TableCell>
                  <TableCell>{session.fileType}</TableCell>
                  <TableCell>{session.hasConverted === true ? "Converted" : "Not converted"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}