import { useState } from 'react';
import SessionViewer from '../components/sessionViewer';
import type { Session, SessionFile } from '../sessions.types';
import find from 'lodash/find';

export default function SessionViewerContainer({ session, sessionFile }: { session: Session, sessionFile: SessionFile }) {

  const [selectedUtteranceId, setSelectedUtteranceId] = useState<number | null>(null);

  const onUtteranceClicked = (selectedUtteranceId: number) => {
    setSelectedUtteranceId(selectedUtteranceId);
  }

  let selectedUtteranceAnnotations = [];

  if (selectedUtteranceId) {
    const selectedUtterance = find(sessionFile.transcript, { _id: selectedUtteranceId });
    if (selectedUtterance) {
      selectedUtteranceAnnotations = selectedUtterance.annotations || [];
    }
  }

  return (
    <SessionViewer
      session={session}
      sessionFile={sessionFile}
      selectedUtteranceId={selectedUtteranceId}
      selectedUtteranceAnnotations={selectedUtteranceAnnotations}
      onUtteranceClicked={onUtteranceClicked}
    />
  );
}