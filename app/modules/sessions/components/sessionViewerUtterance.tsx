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
      className={clsx("flex mb-4", {
        "justify-start": utterance.role === leadRole,
        "justify-end": utterance.role !== leadRole,
      })}
    >
      <div className="flex flex-col max-w-3/4">
        <div
          id={`session-viewer-utterance-${utterance._id}`}
          className={clsx("bg-muted p-4 rounded-4xl scroll-mt-4 border", {
            "bg-purple-100 border-purple-300": isSelected,
            "bg-muted": !isSelected,
            "rounded-bl-none bg-purple-50 border-purple-100":
              utterance.role === leadRole,
            "rounded-br-none border-gray-200 ": utterance.role !== leadRole,
          })}
        >
          {utterance.content}
        </div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center">
          <div>{getUtteranceDetails({ utterance })}</div>
          {utterance.annotations.length > 0 && (
            <Button
              variant="link"
              size={"sm"}
              className="decoration-purple-500"
              onClick={() => onUtteranceClicked(utterance._id)}
            >
              <div className="ml-4 flex items-center text-purple-500 decoration-purple-500 text-xs">
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
