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
  const [selectedUtteranceIndex, setSelectedUtteranceIndex] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const navigate = useNavigate();

  const fetcher = useFetcher();

  const utteranceCount = sessionFile.transcript.length;
  const annotatedUtteranceCount = sessionFile.transcript.filter(u => u.annotations && u.annotations.length > 0).length;
  const annotatedUtterances = sessionFile.transcript.filter(u => u.annotations && u.annotations.length > 0);

  const updateSelectedUtterance = (utteranceId: string) => {
    const newIndex = findIndex(annotatedUtterances, { _id: utteranceId });
    if (newIndex === -1) {
      return;
    }
    setSelectedUtteranceIndex(newIndex);
    setSelectedUtteranceId(utteranceId);
    navigateToUtterance(utteranceId);
  }

  const updateSelectedUtteranceIndex = (index: number) => {
    const utteranceId = annotatedUtterances[index]._id;
    if (!utteranceId) {
      return;
    }
    setSelectedUtteranceIndex(index);
    setSelectedUtteranceId(utteranceId);
    navigateToUtterance(utteranceId);
  }

  const navigateToUtterance = (utteranceId: string) => {
    navigate(`#session-viewer-utterance-${utteranceId}`);
  }

  const onUtteranceClicked = (utteranceId: string) => {
    updateSelectedUtterance(utteranceId);
  }

  const onPreviousAnnotationClicked = () => {
    if (selectedUtteranceIndex !== null && selectedUtteranceIndex > 0) {
      updateSelectedUtteranceIndex(selectedUtteranceIndex - 1);
    }
  }

  const onNextAnnotationClicked = () => {
    if (selectedUtteranceIndex !== null && selectedUtteranceIndex < annotatedUtterances.length - 1) {
      updateSelectedUtteranceIndex(selectedUtteranceIndex + 1);
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
      if (!utteranceId) {
        return;
      } else {
        updateSelectedUtterance(utteranceId);
      }
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
    if (annotatedUtterances.length > 0) {
      updateSelectedUtteranceIndex(0);
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
      selectedUtteranceIndex={selectedUtteranceIndex}
      onUtteranceClicked={onUtteranceClicked}
      onPreviousAnnotationClicked={onPreviousAnnotationClicked}
      onNextAnnotationClicked={onNextAnnotationClicked}
      onJumpToFirstAnnotation={onJumpToFirstAnnotation}
      onDownVoteClicked={onDownVoteClicked}
      onUpVoteClicked={onUpVoteClicked}
    />
  );
}
