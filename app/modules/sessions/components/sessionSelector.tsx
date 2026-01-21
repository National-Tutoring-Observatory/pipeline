import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import map from "lodash/map";
import type { Session } from "../sessions.types";
import { Checkbox } from "@/components/ui/checkbox";
import includes from "lodash/includes";
import SessionRandomizer from "./sessionRandomizer";

export default function SessionSelector({
  sessions = [],
  selectedSessions,
  sampleSize,
  onSelectAllToggled,
  onSelectSessionToggled,
  onSampleSizeChanged,
  onRandomizeClicked,
}: {
  sessions: [];
  selectedSessions: string[];
  sampleSize: number;
  onSelectAllToggled: (isChecked: boolean) => void;
  onSelectSessionToggled: ({
    sessionId,
    isChecked,
  }: {
    sessionId: string;
    isChecked: boolean;
  }) => void;
  onSampleSizeChanged: (size: number) => void;
  onRandomizeClicked: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Select All</span>
        <SessionRandomizer
          sampleSize={sampleSize}
          maxSize={sessions.length}
          onSampleSizeChanged={onSampleSizeChanged}
          onRandomizeClicked={onRandomizeClicked}
        />
      </div>
      <div className="border rounded-md h-80 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={selectedSessions.length === sessions.length}
                  onCheckedChange={(checked) =>
                    onSelectAllToggled(Boolean(checked))
                  }
                />
              </TableHead>
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
                      onCheckedChange={(checked) =>
                        onSelectSessionToggled({
                          sessionId: session._id,
                          isChecked: Boolean(checked),
                        })
                      }
                    ></Checkbox>
                  </TableCell>
                  <TableCell className="font-medium">{session.name}</TableCell>
                  <TableCell>
                    {dayjs(session.createdAt).format(
                      "ddd, MMM D, YYYY - h:mm A",
                    )}
                  </TableCell>
                  <TableCell>{session.fileType}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
