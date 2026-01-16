import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dayjs from "dayjs";
import includes from 'lodash/includes';
import map from 'lodash/map';
import { Shuffle } from "lucide-react";
import type { Session } from "../sessions.types";

export default function SessionSelector({
  sessions = [],
  selectedSessions,
  onSelectAllToggled,
  onSelectSessionToggled,
  onRandomizeClicked
}: {
  sessions: [],
  selectedSessions: string[],
  onSelectAllToggled: (isChecked: boolean) => void,
  onSelectSessionToggled: ({ sessionId, isChecked }: { sessionId: string, isChecked: boolean }) => void,
  onRandomizeClicked?: () => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Select All</span>
        {onRandomizeClicked && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRandomizeClicked}
            className="gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Randomize
          </Button>
        )}
      </div>
      <div className="border rounded-md h-80 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"><Checkbox
                checked={selectedSessions.length === sessions.length}
                onCheckedChange={(checked) => onSelectAllToggled(Boolean(checked))}
              /></TableHead>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>File type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {map(sessions, (session: Session) => {
              return (
                <TableRow key={session._id}>
                  <TableCell className="w-8">
                    <Checkbox
                      checked={includes(selectedSessions, session._id)}
                      onCheckedChange={(checked) => onSelectSessionToggled({ sessionId: session._id, isChecked: Boolean(checked) })}
                    ></Checkbox>
                  </TableCell>
                  <TableCell className="font-medium">
                    {session.name}
                  </TableCell>
                  <TableCell>{dayjs(session.createdAt).format('ddd, MMM D, YYYY - h:mm A')}</TableCell>
                  <TableCell>{session.fileType}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
