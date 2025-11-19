import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import { useEffect, useState } from 'react';
import { useFetcher, useLocation, useNavigate } from 'react-router';
import type { Run } from '~/modules/runs/runs.types';
import SessionViewer from '../components/sessionViewer';
import type { Session, SessionFile } from '../sessions.types';

export default function SessionViewerContainer({ run, session, sessionFile }: { run: Run, session: Session, sessionFile: SessionFile }) {

  const { hash } = useLocation();
  const [selectedUtteranceId, setSelectedUtteranceId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const navigate = useNavigate();

  const fetcher = useFetcher();

  const utteranceCount = sessionFile.transcript.length;
  const annotatedUtteranceCount = sessionFile.transcript.filter(u => u.annotations && u.annotations.length > 0).length;

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

  const onDownVoteClicked = (annotationId: string) => {
    fetcher.submit({ markedAs: 'DOWN_VOTED' }, {
      action: `/api/annotations/${run._id}/${session.sessionId}/${annotationId}`,
      method: "post",
      encType: "application/json"
    });
  }

  const onUpVoteClicked = (annotationId: string) => {
    fetcher.submit({ markedAs: 'UP_VOTED' }, {
      action: `/api/annotations/${run._id}/${session.sessionId}/${annotationId}`,
      method: "post",
      encType: "application/json"
    });
  }

  useEffect(() => {
    if (hash) {
      const utteranceId = hash.replace('#session-viewer-utterance-', '') || '0';
      setSelectedUtteranceId(utteranceId);
      navigate(`#session-viewer-utterance-${utteranceId}`);
    }
  }, []);

  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setIsVoting(true);
    } else if (fetcher.state === 'idle') {
      setIsVoting(false);
    }
  }, [fetcher]);

  let selectedUtteranceAnnotations = [];

  if (selectedUtteranceId) {
    const selectedUtterance = find(sessionFile.transcript, { _id: selectedUtteranceId });
    if (selectedUtterance) {
      selectedUtteranceAnnotations = selectedUtterance.annotations || [];
    }
  }

  // Handler to jump to first annotation
  const onJumpToFirstAnnotation = () => {
    const firstAnnotated = sessionFile.transcript.find(u => u.annotations && u.annotations.length > 0);
    if (firstAnnotated) {
      setSelectedUtteranceId(firstAnnotated._id);
      navigateToUtterance(firstAnnotated._id);
    }
  };

  return (
    <SessionViewer
      session={session}
      sessionFile={sessionFile}
      selectedUtteranceId={selectedUtteranceId}
      selectedUtteranceAnnotations={selectedUtteranceAnnotations}
      isVoting={isVoting}
      utteranceCount={utteranceCount}
      annotatedUtteranceCount={annotatedUtteranceCount}
      onUtteranceClicked={onUtteranceClicked}
      onPreviousUtteranceClicked={onPreviousUtteranceClicked}
      onNextUtteranceClicked={onNextUtteranceClicked}
      onDownVoteClicked={onDownVoteClicked}
      onUpVoteClicked={onUpVoteClicked}
      onJumpToFirstAnnotation={onJumpToFirstAnnotation}
    />
  );
}
