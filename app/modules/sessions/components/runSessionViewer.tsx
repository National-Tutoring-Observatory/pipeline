import { Button } from "@/components/ui/button";
import find from "lodash/find";
import map from "lodash/map";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Run, RunSession } from "~/modules/runs/runs.types";
import SessionVerificationContainer from "../containers/sessionVerificationContainer";
import getSessionVerificationChanges from "../helpers/getSessionVerificationChanges";
import type { Annotation, SessionFile, Utterance } from "../sessions.types";
import SessionViewerAnnotation from "./runSessionViewerAnnotation";
import SessionViewerDetails from "./runSessionViewerDetails";
import SessionViewerUtterance from "./sessionViewerUtterance";

export default function SessionViewer({
  run,
  session,
  sessionFile,
  selectedUtteranceId,
  selectedUtteranceAnnotations,
  isVoting,
  utteranceCount,
  selectedUtteranceIndex,
  annotatedUtteranceCount,
  shouldShowVerificationDetails,
  onToggleVerificationDetails,
  onUtteranceClicked,
  onPreviousAnnotationClicked,
  onNextAnnotationClicked,
  onJumpToFirstAnnotation,
  onDownVoteClicked,
  onUpVoteClicked,
  onSaveVotingReason,
  isSavingReason,
}: {
  run: Run;
  session: RunSession;
  sessionFile: SessionFile;
  selectedUtteranceAnnotations: Annotation[];
  selectedUtteranceId: string | null;
  isVoting: boolean;
  isSavingReason: boolean;
  utteranceCount: number;
  selectedUtteranceIndex: number | null;
  annotatedUtteranceCount: number;
  shouldShowVerificationDetails: boolean;
  onToggleVerificationDetails: () => void;
  onUtteranceClicked: (utteranceId: string) => void;
  onPreviousAnnotationClicked: () => void;
  onNextAnnotationClicked: () => void;
  onJumpToFirstAnnotation: () => void;
  onDownVoteClicked: (utteranceId: string, annotationIndex: number) => void;
  onUpVoteClicked: (utteranceId: string, annotationIndex: number) => void;
  onSaveVotingReason: (
    utteranceId: string,
    annotationIndex: number,
    reason: string,
  ) => void;
}) {
  const hasSelectedAnnotation = selectedUtteranceIndex !== null;

  const verificationChanges = getSessionVerificationChanges(run, sessionFile);

  const getPreAnnotation = (annotation: Annotation) =>
    find(
      verificationChanges?.changed,
      (c: { after: Annotation; before: Annotation }) =>
        c.after._id === annotation._id,
    )?.before ?? null;

  return (
    <div className="flex h-full flex-1">
      <div
        id="session-viewer-scroll-container"
        className="flex h-full w-3/5 min-w-0 flex-col overflow-y-scroll scroll-smooth border-r p-4"
      >
        {map(sessionFile.transcript, (utterance: Utterance, index: number) => {
          const isSelected = selectedUtteranceId === utterance._id;
          const hasVerificationChanges = verificationChanges?.changed.some(
            (c) => c.after._id === utterance._id,
          );
          return (
            <SessionViewerUtterance
              key={utterance._id}
              utteranceNumber={index + 1}
              leadRole={sessionFile.leadRole}
              utterance={utterance}
              isSelected={isSelected}
              hasVerificationChanges={hasVerificationChanges}
              shouldShowVerificationDetails={shouldShowVerificationDetails}
              onUtteranceClicked={onUtteranceClicked}
            />
          );
        })}
      </div>
      <div className="flex h-full w-2/5 min-w-0 flex-col pt-8">
        <div className="border-b px-4 pb-4">
          <SessionViewerDetails
            session={session}
            utteranceCount={utteranceCount}
            annotatedUtteranceCount={annotatedUtteranceCount}
          />
          <SessionVerificationContainer
            run={run}
            sessionFile={sessionFile}
            shouldShowVerificationDetails={shouldShowVerificationDetails}
            onToggleVerificationDetails={onToggleVerificationDetails}
          />
        </div>
        {sessionFile.annotations && sessionFile.annotations.length > 0 && (
          <div className="flex min-h-0 flex-1 flex-col p-4 pb-0">
            <div className="text-muted-foreground mb-2">
              Session annotations
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {map(sessionFile.annotations, (annotation, index) => {
                return (
                  <SessionViewerAnnotation
                    key={`${annotation._id}-${index}-${annotation.votingReason || ""}`}
                    annotation={annotation}
                    preAnnotation={getPreAnnotation(annotation)}
                    isVoting={isVoting}
                    isSavingReason={isSavingReason}
                    onDownVoteClicked={() =>
                      onDownVoteClicked(annotation._id, index)
                    }
                    onUpVoteClicked={() =>
                      onUpVoteClicked(annotation._id, index)
                    }
                    onSaveVotingReason={(reason) =>
                      onSaveVotingReason(annotation._id, index, reason)
                    }
                  />
                );
              })}
            </div>
          </div>
        )}
        {annotatedUtteranceCount > 0 && (
          <div className="flex min-h-0 flex-1 flex-col p-4 pb-0">
            <div className="mb-2 flex items-center justify-between">
              <div>
                View Annotations
                <p className="text-muted-foreground text-xs">
                  Browse annotations in this session
                </p>
              </div>
            </div>
            <div className="my-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={onJumpToFirstAnnotation}
                >
                  First annotation
                </Button>
                {hasSelectedAnnotation && (
                  <div className="text-muted-foreground text-sm">
                    {selectedUtteranceIndex + 1}/{annotatedUtteranceCount}
                  </div>
                )}
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPreviousAnnotationClicked}
                    disabled={
                      !hasSelectedAnnotation || selectedUtteranceIndex == 0
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNextAnnotationClicked}
                    disabled={
                      hasSelectedAnnotation &&
                      selectedUtteranceIndex == annotatedUtteranceCount - 1
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {map(selectedUtteranceAnnotations, (annotation, index) => {
                return (
                  <SessionViewerAnnotation
                    key={`${annotation._id}-${index}-${annotation.votingReason || ""}`}
                    annotation={annotation}
                    preAnnotation={getPreAnnotation(annotation)}
                    isVoting={isVoting}
                    isSavingReason={isSavingReason}
                    onDownVoteClicked={() =>
                      onDownVoteClicked(annotation._id, index)
                    }
                    onUpVoteClicked={() =>
                      onUpVoteClicked(annotation._id, index)
                    }
                    onSaveVotingReason={(reason) =>
                      onSaveVotingReason(annotation._id, index, reason)
                    }
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
