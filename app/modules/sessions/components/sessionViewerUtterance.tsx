import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { BadgeCheck, MinusCircle, NotebookPen } from "lucide-react";
import getUtteranceDetails from "../helpers/getUtteranceDetails";
import type { Utterance } from "../sessions.types";

export default function SessionViewerUtterance({
  utterance,
  utteranceNumber,
  leadRole = "TEACHER",
  isSelected,
  hasVerificationChanges,
  hasRemovedAnnotation,
  shouldShowVerificationDetails,
  onUtteranceClicked,
}: {
  utterance: Utterance;
  utteranceNumber: number;
  leadRole: string;
  isSelected: boolean;
  hasVerificationChanges?: boolean;
  hasRemovedAnnotation?: boolean;
  shouldShowVerificationDetails: boolean;
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
          className={clsx("scroll-mt-4 rounded-4xl border p-4", {
            "border-sandpiper-accent/30 bg-sandpiper-accent/10": isSelected,
            "bg-sandpiper-elevated rounded-bl-none":
              !isSelected && utterance.role === leadRole,
            "border-sandpiper-surface bg-sandpiper-surface rounded-br-none":
              !isSelected && utterance.role !== leadRole,
          })}
        >
          {utterance.content}
        </div>
        <div className="text-muted-foreground mt-1 flex min-h-8 items-center text-xs">
          <div>
            #{utteranceNumber} · {getUtteranceDetails({ utterance })}
          </div>
          {utterance.annotations.length > 0 && (
            <Button
              variant="link"
              size={"sm"}
              className="decoration-sandpiper-accent"
              onClick={() => onUtteranceClicked(utterance._id)}
            >
              <div className="text-sandpiper-accent decoration-sandpiper-accent ml-4 flex items-center text-xs">
                <NotebookPen className="mr-1 size-3" />
                {utterance.annotations.length} annotation
                {utterance.annotations.length > 1 ? "s" : ""}
                {hasVerificationChanges && shouldShowVerificationDetails && (
                  <BadgeCheck className="text-muted-foreground ml-1 size-3" />
                )}
              </div>
            </Button>
          )}
          {hasRemovedAnnotation && shouldShowVerificationDetails && (
            <Button
              variant="link"
              size={"sm"}
              className="decoration-sandpiper-accent ml-4"
              onClick={() => onUtteranceClicked(utterance._id)}
            >
              <div className="text-destructive flex items-center text-xs">
                <MinusCircle className="mr-1 size-3" />
                Removed by verification
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
