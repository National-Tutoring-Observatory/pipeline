import find from "lodash/find";
import findIndex from "lodash/findIndex";
import { useEffect, useState } from "react";
import { useFetcher, useLocation, useNavigate } from "react-router";
import type { Run } from "~/modules/runs/runs.types";
import SessionViewer from "../components/sessionViewer";
import type { Session, SessionFile } from "../sessions.types";

export default function SessionViewerContainer({
  run,
  session,
  sessionFile,
}: {
  run: Run;
  session: Session;
  sessionFile: SessionFile;
}) {
  const { hash } = useLocation();
  const [selectedUtteranceId, setSelectedUtteranceId] = useState<string | null>(
    null,
  );
  const [selectedUtteranceIndex, setSelectedUtteranceIndex] = useState<
    number | null
  >(null);
  const [isVoting, setIsVoting] = useState(false);
  const navigate = useNavigate();

  const fetcher = useFetcher();

  const utteranceCount = sessionFile.transcript.length;
  const annotatedUtteranceCount = sessionFile.transcript.filter(
    (u) => u.annotations && u.annotations.length > 0,
  ).length;
  const annotatedUtterances = sessionFile.transcript.filter(
    (u) => u.annotations && u.annotations.length > 0,
  );

  const updateSelectedUtterance = (utteranceId: string) => {
    const newIndex = findIndex(annotatedUtterances, { _id: utteranceId });
    if (newIndex === -1) {
      return;
    }
    setSelectedUtteranceIndex(newIndex);
    setSelectedUtteranceId(utteranceId);
    navigateToUtterance(utteranceId);
  };

  const updateSelectedUtteranceIndex = (index: number) => {
    const utteranceId = annotatedUtterances[index]._id;
    if (!utteranceId) {
      return;
    }
    setSelectedUtteranceIndex(index);
    setSelectedUtteranceId(utteranceId);
    navigateToUtterance(utteranceId);
  };

  const navigateToUtterance = (utteranceId: string) => {
    navigate(`#session-viewer-utterance-${utteranceId}`, { replace: true });
  };

  const onUtteranceClicked = (utteranceId: string) => {
    updateSelectedUtterance(utteranceId);
  };

  const onPreviousAnnotationClicked = () => {
    if (selectedUtteranceIndex !== null && selectedUtteranceIndex > 0) {
      updateSelectedUtteranceIndex(selectedUtteranceIndex - 1);
    }
  };

  const onNextAnnotationClicked = () => {
    if (
      selectedUtteranceIndex !== null &&
      selectedUtteranceIndex < annotatedUtterances.length - 1
    ) {
      updateSelectedUtteranceIndex(selectedUtteranceIndex + 1);
    }
  };

  const onDownVoteClicked = (utteranceId: string, annotationIndex: number) => {
    fetcher.submit(
      { markedAs: "DOWN_VOTED" },
      {
        action: `/api/annotations/${run._id}/${session.sessionId}/${utteranceId}/${annotationIndex}`,
        method: "post",
        encType: "application/json",
      },
    );
  };

  const onUpVoteClicked = (utteranceId: string, annotationIndex: number) => {
    fetcher.submit(
      { markedAs: "UP_VOTED" },
      {
        action: `/api/annotations/${run._id}/${session.sessionId}/${utteranceId}/${annotationIndex}`,
        method: "post",
        encType: "application/json",
      },
    );
  };

  useEffect(() => {
    if (!hash) {
      setSelectedUtteranceIndex(null);
      setSelectedUtteranceId(null);
      return;
    }

    const utteranceId = hash.replace("#session-viewer-utterance-", "");
    const utteranceIndex = findIndex(annotatedUtterances, { _id: utteranceId });

    if (utteranceIndex === -1) {
      setSelectedUtteranceIndex(null);
      setSelectedUtteranceId(null);
    } else {
      setSelectedUtteranceIndex(utteranceIndex);
      setSelectedUtteranceId(utteranceId);
    }
  }, [hash]);

  useEffect(() => {
    if (fetcher.state === "submitting") {
      setIsVoting(true);
    } else if (fetcher.state === "idle") {
      setIsVoting(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (selectedUtteranceId) {
      const element = document.getElementById(
        `session-viewer-utterance-${selectedUtteranceId}`,
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      const container = document.getElementById(
        "session-viewer-scroll-container",
      );
      if (container) container.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedUtteranceId]);

  let selectedUtteranceAnnotations = [];

  if (selectedUtteranceId) {
    const selectedUtterance = find(sessionFile.transcript, {
      _id: selectedUtteranceId,
    });
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
