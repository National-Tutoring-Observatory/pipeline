import dayjs from "dayjs";
import type { Session } from "../sessions.types";

interface SessionViewerDetailsProps {
  session: Session;
  utteranceCount: number;
  annotatedUtteranceCount: number;
}

export default function SessionViewerDetails({
  session,
  utteranceCount: utteranceCount,
  annotatedUtteranceCount: annotatedUtteranceCount,
}: SessionViewerDetailsProps) {
  return (
    <div className="border-b px-4 pb-4">
      <div className="mb-2">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground">Started</span>
          <span className="text-right">
            {session.startedAt
              ? dayjs(session.startedAt).format("MMM DD, YYYY, h:mm A")
              : "--"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Finished</span>
          <span className="text-right">
            {session.finishedAt
              ? dayjs(session.finishedAt).format("MMM DD, YYYY, h:mm A")
              : "--"}
          </span>
        </div>
        {annotatedUtteranceCount > 0 && (
          <div className="mt-2 mb-4">
            <div className="text-muted-foreground mb-4">Summary</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card flex flex-col items-center rounded-lg border p-3">
                <div className="text-muted-foreground mb-1 text-xs">
                  Total utterances
                </div>
                <div className="text-2xl font-bold">{utteranceCount}</div>
              </div>
              <div className="bg-card flex flex-col items-center rounded-lg border p-3">
                <div className="text-muted-foreground mb-1 text-xs">
                  Annotated
                </div>
                <div className="text-2xl font-bold">
                  {annotatedUtteranceCount}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
