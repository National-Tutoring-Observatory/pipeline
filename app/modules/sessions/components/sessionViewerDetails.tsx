import dayjs from "dayjs";
import type { Session } from "../sessions.types";

export default function SessionViewerDetails({ session }: { session: Session }) {
  return (
    <div className="border-b px-4">
      <div className="flex mb-4">
        <div className="mr-2 text-muted-foreground">
          Started
        </div>
        <div>
          {session.startedAt ? dayjs(session.startedAt).format('ddd, MM/D/YY - h:mma') : '--'}
        </div>
      </div>
      <div className="flex mb-4">
        <div className="mr-2 text-muted-foreground">
          Finished
        </div>
        <div>
          {session.finishedAt ? dayjs(session.finishedAt).format('ddd, MM/D/YY - h:mma') : '--'}
        </div>
      </div>
    </div>
  );
}