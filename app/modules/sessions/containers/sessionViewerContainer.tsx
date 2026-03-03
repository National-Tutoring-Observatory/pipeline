import find from "lodash/find";
import findIndex from "lodash/findIndex";
import { useEffect } from "react";
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
  const navigate = useNavigate();

  const fetcher = useFetcher();

  const utteranceCount = sessionFile.transcript.length;
  const annotatedUtteranceCount = sessionFile.transcript.filter(
    (u) => u.annotations && u.annotations.length > 0,
  ).length;
  const annotatedUtterances = sessionFile.transcript.filter(
    (u) => u.annotations && u.annotations.length > 0,
  );

  const hashUtteranceId = hash
    ? hash.replace("#session-viewer-utterance-", "")
    : null;
  const hashUtteranceIndex = hashUtteranceId
    ? findIndex(annotatedUtterances, { _id: hashUtteranceId })
    : -1;
  const selectedUtteranceId =
    hashUtteranceIndex !== -1 ? hashUtteranceId : null;
  const selectedUtteranceIndex =
    hashUtteranceIndex !== -1 ? hashUtteranceIndex : null;

  const navigateToUtterance = (utteranceId: string) => {
    navigate(`#session-viewer-utterance-${utteranceId}`, { replace: true });
  };

  const onUtteranceClicked = (utteranceId: string) => {
    const newIndex = findIndex(annotatedUtterances, { _id: utteranceId });
    if (newIndex !== -1) {
      navigateToUtterance(utteranceId);
    }
  };

  const onPreviousAnnotationClicked = () => {
    if (selectedUtteranceIndex !== null && selectedUtteranceIndex > 0) {
      navigateToUtterance(annotatedUtterances[selectedUtteranceIndex - 1]._id);
    }
  };

  const onNextAnnotationClicked = () => {
    if (selectedUtteranceIndex === null) {
      if (annotatedUtterances.length > 0) {
        navigateToUtterance(annotatedUtterances[0]._id);
      }
      return;
    }
    if (selectedUtteranceIndex < annotatedUtterances.length - 1) {
      navigateToUtterance(annotatedUtterances[selectedUtteranceIndex + 1]._id);
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

  const isVoting = fetcher.state !== "idle";

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

  const onJumpToFirstAnnotation = () => {
    if (annotatedUtterances.length > 0) {
      navigateToUtterance(annotatedUtterances[0]._id);
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
