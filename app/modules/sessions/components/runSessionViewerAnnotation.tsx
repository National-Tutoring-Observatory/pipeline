import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import clsx from "clsx";
import map from "lodash/map";
import { Check, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import type { Annotation } from "../sessions.types";
import SessionViewerAnnotationValue from "./runSessionViewerAnnotationValue";

const HIDDEN_ANNOTATION_KEYS = new Set([
  "_id",
  "identifiedBy",
  "markedAs",
  "votingReason",
]);

export default function SessionViewerAnnotation({
  annotation,
  isVoting,
  isSavingReason,
  onDownVoteClicked,
  onUpVoteClicked,
  onSaveVotingReason,
}: {
  annotation: Annotation & any;
  isVoting: boolean;
  isSavingReason: boolean;
  onDownVoteClicked: () => void;
  onUpVoteClicked: () => void;
  onSaveVotingReason: (reason: string) => void;
}) {
  const [reason, setReason] = useState(annotation.votingReason || "");

  const hasVoted = !!annotation.markedAs;
  const hasUnsavedChanges = reason !== (annotation.votingReason || "");

  return (
    <div className="bg-muted mb-2 rounded-md p-4">
      {map(annotation, (annotationValue, annotationKey) => {
        if (HIDDEN_ANNOTATION_KEYS.has(annotationKey)) {
          return null;
        }

        return (
          <div className="mb-2" key={annotationKey}>
            <div className="text-muted-foreground text-xs">{annotationKey}</div>
            <SessionViewerAnnotationValue value={annotationValue} />
          </div>
        );
      })}
      <div className="flex items-center justify-between">
        <div>
          <Badge>{`Identified by ${annotation.identifiedBy}`}</Badge>
        </div>
        <div className="flex items-center gap-x-4">
          <Button
            variant="outline"
            size="icon"
            disabled={isVoting}
            onClick={onDownVoteClicked}
            className={clsx({
              "border-sandpiper-accent": annotation.markedAs === "DOWN_VOTED",
            })}
          >
            <ThumbsDown
              size={10}
              className={clsx({
                "stroke-sandpiper-accent": annotation.markedAs === "DOWN_VOTED",
              })}
            />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={isVoting}
            onClick={onUpVoteClicked}
            className={clsx({
              "border-sandpiper-accent": annotation.markedAs === "UP_VOTED",
            })}
          >
            <ThumbsUp
              size={10}
              className={clsx({
                "stroke-sandpiper-accent": annotation.markedAs === "UP_VOTED",
              })}
            />
          </Button>
        </div>
      </div>
      {hasVoted && (
        <div className="mt-3 flex gap-2">
          <Textarea
            placeholder="Reason for your decision..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSavingReason}
            maxLength={280}
            className="min-h-[60px] text-xs"
          />
          <Button
            variant="outline"
            size="icon"
            disabled={isSavingReason || !hasUnsavedChanges}
            onClick={() => onSaveVotingReason(reason)}
            className="shrink-0"
          >
            <Check size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
