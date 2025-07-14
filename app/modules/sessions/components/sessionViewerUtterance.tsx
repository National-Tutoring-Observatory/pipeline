import clsx from "clsx";
import { NotebookPen } from "lucide-react";
import type { Utterance } from "../sessions.types";
import { Button } from "@/components/ui/button";

export default function SessionViewerUtterance({
  utterance,
  isSelected,
  onUtteranceClicked,
}: {
  utterance: Utterance,
  isSelected: boolean,
  onUtteranceClicked: (utteranceId: string) => void
}) {
  return (
    <div key={utterance._id} className={clsx('flex mb-4', {
      'justify-start': utterance.role === 'TEACHER',
      'justify-end': utterance.role !== 'TEACHER',
    })}>
      <div className="flex flex-col max-w-3/4">
        <div
          id={`session-viewer-utterance-${utterance._id}`}
          className={clsx("bg-muted p-4 rounded-lg scroll-mt-4", {
            "bg-purple-200": isSelected,
            "bg-muted": !isSelected
          })}>
          {utterance.content}
        </div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center">
          <div>
            {utterance.start_time} - {utterance.role}
          </div>
          {(utterance.annotations.length > 0) && (
            <Button variant="link" size={"sm"} className="decoration-purple-500" onClick={() => onUtteranceClicked(utterance._id)}>
              <div className="ml-4 flex items-center text-purple-500 decoration-purple-500 text-xs">
                <NotebookPen className="mr-1 size-3" />
                {utterance.annotations.length} annotation{utterance.annotations.length > 1 ? 's' : ''}
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}