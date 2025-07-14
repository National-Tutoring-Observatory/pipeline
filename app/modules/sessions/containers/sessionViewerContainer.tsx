import { useEffect, useState } from 'react';
import SessionViewer from '../components/sessionViewer';
import type { Session, SessionFile } from '../sessions.types';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import { useLocation, useNavigate } from 'react-router';

export default function SessionViewerContainer({ session, sessionFile }: { session: Session, sessionFile: SessionFile }) {

  const { hash } = useLocation();
  const [selectedUtteranceId, setSelectedUtteranceId] = useState<string | null>(null);
  const navigate = useNavigate();

  const navigateToUtterance = (utteranceId: string) => {
    navigate(`#session-viewer-utterance-${utteranceId}`);
  }

  const onUtteranceClicked = (selectedUtteranceId: string) => {
    setSelectedUtteranceId(selectedUtteranceId);
    navigateToUtterance(selectedUtteranceId);
  }

  const onPreviousUtteranceClicked = () => {
    if (selectedUtteranceId) {
      const selectedUtteranceIndex = findIndex(sessionFile.transcript, { _id: selectedUtteranceId });
      let previousUtterance;
      for (let index = selectedUtteranceIndex - 1; index > 0; index--) {
        if (sessionFile.transcript[index].annotations.length > 0 && !previousUtterance) {
          previousUtterance = sessionFile.transcript[index];
        }
      }
      if (previousUtterance) {
        setSelectedUtteranceId(previousUtterance._id);
        navigateToUtterance(previousUtterance._id);
      }
    }
  }

  const onNextUtteranceClicked = () => {
    if (selectedUtteranceId) {
      const selectedUtteranceIndex = findIndex(sessionFile.transcript, { _id: selectedUtteranceId });
      let nextUtterance;
      for (let index = selectedUtteranceIndex + 1; index < sessionFile.transcript.length; index++) {
        if (sessionFile.transcript[index].annotations.length > 0 && !nextUtterance) {
          nextUtterance = sessionFile.transcript[index];
        }
      }
      if (nextUtterance) {
        setSelectedUtteranceId(nextUtterance._id);
        navigateToUtterance(nextUtterance._id);
      }
    }
  }

  useEffect(() => {
    if (hash) {
      const utteranceId = hash.replace('#session-viewer-utterance-', '') || '0';
      setSelectedUtteranceId(utteranceId);
      navigate(`#session-viewer-utterance-${utteranceId}`);
    }
  }, []);

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
      onPreviousUtteranceClicked={onPreviousUtteranceClicked}
      onNextUtteranceClicked={onNextUtteranceClicked}
    />
  );
}