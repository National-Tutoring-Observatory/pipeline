import { Badge } from "@/components/ui/badge";
import type { Annotation, Utterance } from "../sessions.types";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import SessionViewerAnnotationValue from './sessionViewerAnnotationValue';
import map from 'lodash/map';

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
      {map(annotation, (annotationValue, annotationKey) => {
        if (annotationKey === '_id' || annotationKey === 'identifiedBy') {
          return null;
        }

        return (
          <div className="mb-2" key={annotationKey} >
            <div className="text-xs text-muted-foreground">
              {annotationKey}
            </div>
            <SessionViewerAnnotationValue value={annotationValue} />
          </div>
        )

      })}
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