import map from 'lodash/map';
import type { Annotation, Session, SessionFile, Utterance } from '../sessions.types';
import SessionViewerAnnotation from './sessionViewerAnnotation';
import SessionViewerDetails from './sessionViewerDetails';
import SessionViewerUtterance from './sessionViewerUtterance';

export default function SessionViewer({
  session,
  sessionFile,
  selectedUtteranceId,
  selectedUtteranceAnnotations,
  onUtteranceClicked,
}: {
  session: Session,
  sessionFile: SessionFile,
  selectedUtteranceAnnotations: Annotation[],
  selectedUtteranceId: number | null,
  onUtteranceClicked: (utteranceId: number) => void;
}) {
  return (
    <div className="border h-[calc(100vh-180px)] flex rounded-md">
      <div className="flex flex-col w-3/5 p-4 h-full overflow-y-scroll border-r">
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
                />
              );
            })}
          </div>
        )}
        {(selectedUtteranceAnnotations.length > 0) && (
          <div className="p-4">
            <div className="text-muted-foreground mb-2">
              Utterance annotations
            </div>
            {map(selectedUtteranceAnnotations, (annotation) => {
              return (
                <SessionViewerAnnotation
                  key={annotation._id}
                  annotation={annotation}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}