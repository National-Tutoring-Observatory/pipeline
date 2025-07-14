import map from 'lodash/map';
import type { Session, SessionFile, Utterance } from '../sessions.types';
import clsx from 'clsx';
import { NotebookPen } from 'lucide-react';
import dayjs from 'dayjs';
import { Badge } from '@/components/ui/badge';
import SessionViewerAnnotation from './sessionViewerAnnotation';
import SessionViewerDetails from './sessionViewerDetails';
import SessionViewerUtterance from './sessionViewerUtterance';

export default function SessionViewer({ session, sessionFile }: { session: Session, sessionFile: SessionFile }) {
  return (
    <div className="border h-[calc(100vh-180px)] flex rounded-md">
      <div className="flex flex-col w-3/5 p-4 h-full overflow-y-scroll border-r">
        {map(sessionFile.transcript, (utterance: Utterance) => {
          return (
            <SessionViewerUtterance key={utterance._id} utterance={utterance} />
          );
        })}
      </div>
      <div className="py-8 w-2/5">
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
      </div>
    </div>
  );
}