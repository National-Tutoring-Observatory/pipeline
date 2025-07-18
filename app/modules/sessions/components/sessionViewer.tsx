import map from 'lodash/map';
import type { Annotation, Session, SessionFile, Utterance } from '../sessions.types';
import SessionViewerAnnotation from './sessionViewerAnnotation';
import SessionViewerDetails from './sessionViewerDetails';
import SessionViewerUtterance from './sessionViewerUtterance';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function SessionViewer({
  session,
  sessionFile,
  selectedUtteranceId,
  selectedUtteranceAnnotations,
  onUtteranceClicked,
  onPreviousUtteranceClicked,
  onNextUtteranceClicked,
  onDownVoteClicked,
  onUpVoteClicked
}: {
  session: Session,
  sessionFile: SessionFile,
  selectedUtteranceAnnotations: Annotation[],
  selectedUtteranceId: string | null,
  onUtteranceClicked: (utteranceId: string) => void;
  onPreviousUtteranceClicked: () => void;
  onNextUtteranceClicked: () => void;
  onDownVoteClicked: (annotationId: string) => void;
  onUpVoteClicked: (annotationId: string) => void;
}) {
  return (
    <div className="border h-[calc(100vh-200px)] flex rounded-md">
      <div className="flex flex-col w-3/5 p-4 h-full overflow-y-scroll scroll-smooth border-r">
        {map(sessionFile.transcript, (utterance: Utterance) => {
          const isSelected = selectedUtteranceId === utterance._id;
          return (
            <SessionViewerUtterance
              key={utterance._id}
              utterance={utterance}
              isSelected={isSelected}
              onUtteranceClicked={onUtteranceClicked}
            />
          );
        })}
      </div>
      <div className="py-8 w-2/5 h-full">
        <SessionViewerDetails session={session} />
        {(sessionFile.annotations && sessionFile.annotations.length > 0) && (
          <div className="p-4">
            <div className="text-muted-foreground mb-2">
              Session annotations
            </div>
            {map(sessionFile.annotations, (annotation) => {
              return (
                <SessionViewerAnnotation
                  key={annotation._id}
                  annotation={annotation}
                  onDownVoteClicked={() => onDownVoteClicked(annotation._id)}
                  onUpVoteClicked={() => onUpVoteClicked(annotation._id)}
                />
              );
            })}
          </div>
        )}
        {(selectedUtteranceAnnotations.length > 0) && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-muted-foreground ">
                Utterance annotations
              </div>
              <div>
                <Button variant="ghost" size="icon" onClick={onPreviousUtteranceClicked}>
                  <ChevronUp />
                </Button>
                <Button variant="ghost" size="icon" onClick={onNextUtteranceClicked}>
                  <ChevronDown />
                </Button>
              </div>
            </div>
            {map(selectedUtteranceAnnotations, (annotation) => {
              return (
                <SessionViewerAnnotation
                  key={annotation._id}
                  annotation={annotation}
                  onDownVoteClicked={() => onDownVoteClicked(annotation._id)}
                  onUpVoteClicked={() => onUpVoteClicked(annotation._id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}