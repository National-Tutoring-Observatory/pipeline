import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { CornerDownRight } from "lucide-react";
import type { Session } from "../sessions.types";


interface SessionViewerDetailsProps {
  session: Session;
  utteranceCount: number;
  annotatedUtteranceCount: number;
  onJumpToFirstAnnotation: () => void;
}

export default function SessionViewerDetails({
  session,
  utteranceCount: utteranceCount,
  annotatedUtteranceCount: annotatedUtteranceCount,
  onJumpToFirstAnnotation,
}: SessionViewerDetailsProps) {
  return (
    <div className="border-b px-4 pb-4">
      <div className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground">Started</span>
          <span className="text-right">{session.startedAt ? dayjs(session.startedAt).format('MMM DD, YYYY, h:mm A') : '--'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Finished</span>
          <span className="text-right">{session.finishedAt ? dayjs(session.finishedAt).format('MMM DD, YYYY, h:mm A') : '--'}</span>
        </div>
        {(annotatedUtteranceCount > 0) && (
          <div className="mt-2 mb-4">
            <div className="text-muted-foreground mb-4">Summary</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-card p-3 flex flex-col items-center">
                <div className="text-xs text-muted-foreground mb-1">Total utterances</div>
                <div className="text-2xl font-bold">{utteranceCount}</div>
              </div>
              <div className="rounded-lg border bg-card p-3 flex flex-col items-center">
                <div className="text-xs text-muted-foreground mb-1">Annotated</div>
                <div className="text-2xl font-bold">{annotatedUtteranceCount}</div>
              </div>
            </div>
            <div className="w-full flex justify-center mt-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={onJumpToFirstAnnotation}
                className="w-full border bg-muted/50 hover:bg-muted text-base font-medium rounded-xl py-4 flex items-center justify-center gap-2 shadow-none"
              >
                Jump to first annotation
                <CornerDownRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
