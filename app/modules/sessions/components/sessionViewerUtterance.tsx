import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { NotebookPen } from "lucide-react";
import getUtteranceDetails from "../helpers/getUtteranceDetails";
import type { Utterance } from "../sessions.types";

export default function SessionViewerUtterance({
  utterance,
  leadRole = "TEACHER",
  isSelected,
  onUtteranceClicked,
}: {
  utterance: Utterance;
  leadRole: string;
  isSelected: boolean;
  onUtteranceClicked: (utteranceId: string) => void;
}) {
  return (
    <div
      key={utterance._id}
      className={clsx("mb-4 flex", {
        "justify-start": utterance.role === leadRole,
        "justify-end": utterance.role !== leadRole,
      })}
    >
      <div className="flex max-w-3/4 flex-col">
        <div
          id={`session-viewer-utterance-${utterance._id}`}
          className={clsx("bg-muted scroll-mt-4 rounded-4xl border p-4", {
            "border-purple-300 bg-purple-100": isSelected,
            "bg-muted": !isSelected,
            "rounded-bl-none border-purple-100 bg-purple-50":
              utterance.role === leadRole,
            "rounded-br-none border-gray-200": utterance.role !== leadRole,
          })}
        >
          {utterance.content}
        </div>
        <div className="text-muted-foreground mt-1 flex items-center text-xs">
          <div>{getUtteranceDetails({ utterance })}</div>
          {utterance.annotations.length > 0 && (
            <Button
              variant="link"
              size={"sm"}
              className="decoration-purple-500"
              onClick={() => onUtteranceClicked(utterance._id)}
            >
              <div className="ml-4 flex items-center text-xs text-purple-500 decoration-purple-500">
                <NotebookPen className="mr-1 size-3" />
                {utterance.annotations.length} annotation
                {utterance.annotations.length > 1 ? "s" : ""}
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
