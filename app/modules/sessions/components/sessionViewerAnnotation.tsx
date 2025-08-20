import { Badge } from "@/components/ui/badge";
import type { Annotation, Utterance } from "../sessions.types";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import has from 'lodash/has';

export default function SessionViewerAnnotation({
  annotation,
  isVoting,
  onDownVoteClicked,
  onUpVoteClicked
}: {
  annotation: Annotation & any,
  isVoting: boolean,
  onDownVoteClicked: () => void,
  onUpVoteClicked: () => void
}) {
  return (
    <div className="p-4 bg-muted rounded-md mb-2">
      {(has(annotation, 'teacherMove')) && (

        <div className="mb-2">
          <div className="text-xs text-muted-foreground">
            Teacher move
          </div>
          <div>
            {annotation.teacherMove}
          </div>
        </div>
      )}
      {(has(annotation, 'tutorMove')) && (

        <div className="mb-2">
          <div className="text-xs text-muted-foreground">
            Tutor move
          </div>
          <div>
            {annotation.tutorMove}
          </div>
        </div>
      )}
      {(has(annotation, 'score')) && (
        <div className="mb-2">
          <div className="text-xs text-muted-foreground">
            Score
          </div>
          <div>
            {annotation.score}
          </div>
        </div>
      )}
      <div className="mb-2">
        <div className="text-xs text-muted-foreground">
          Reasoning
        </div>
        <div>
          {annotation.reasoning}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <Badge>
            {`Identified by ${annotation.identifiedBy}`}
          </Badge>
        </div>
        <div className="flex items-center gap-x-4">
          <Button variant="outline" size="icon" disabled={isVoting} onClick={onDownVoteClicked} className={clsx({ 'border-purple-700': annotation.markedAs === 'DOWN_VOTED' })}>
            <ThumbsDown size={10} className={clsx({ 'stroke-purple-700': annotation.markedAs === 'DOWN_VOTED' })} />
          </Button>
          <Button variant="outline" size="icon" disabled={isVoting} onClick={onUpVoteClicked} className={clsx({ 'border-purple-700': annotation.markedAs === 'UP_VOTED' })}>
            <ThumbsUp size={10} className={clsx({ 'stroke-purple-700': annotation.markedAs === 'UP_VOTED' })} />
          </Button>
        </div>
      </div>
    </div >
  );
}