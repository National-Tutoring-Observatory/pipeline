import { Button } from "@/components/ui/button";
import map from "lodash/map";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type {
  Annotation,
  Session,
  SessionFile,
  Utterance,
} from "../sessions.types";
import SessionViewerAnnotation from "./sessionViewerAnnotation";
import SessionViewerDetails from "./sessionViewerDetails";
import SessionViewerUtterance from "./sessionViewerUtterance";

export default function SessionViewer({
  session,
  sessionFile,
  selectedUtteranceId,
  selectedUtteranceAnnotations,
  isVoting,
  utteranceCount,
  selectedUtteranceIndex,
  annotatedUtteranceCount,
  onUtteranceClicked,
  onPreviousAnnotationClicked,
  onNextAnnotationClicked,
  onJumpToFirstAnnotation,
  onDownVoteClicked,
  onUpVoteClicked,
}: {
  session: Session;
  sessionFile: SessionFile;
  selectedUtteranceAnnotations: Annotation[];
  selectedUtteranceId: string | null;
  isVoting: boolean;
  utteranceCount: number;
  selectedUtteranceIndex: number | null;
  annotatedUtteranceCount: number;
  onUtteranceClicked: (utteranceId: string) => void;
  onPreviousAnnotationClicked: () => void;
  onNextAnnotationClicked: () => void;
  onJumpToFirstAnnotation: () => void;
  onDownVoteClicked: (annotationId: string) => void;
  onUpVoteClicked: (annotationId: string) => void;
}) {
  const hasSelectedAnnotation = selectedUtteranceIndex !== null;

  return (
    <div className="border h-[calc(100vh-200px)] flex rounded-md">
      <div
        id="session-viewer-scroll-container"
        className="flex flex-col w-3/5 p-4 h-full overflow-y-scroll scroll-smooth border-r"
      >
        {map(sessionFile.transcript, (utterance: Utterance) => {
          const isSelected = selectedUtteranceId === utterance._id;
          return (
            <SessionViewerUtterance
              key={utterance._id}
              leadRole={sessionFile.leadRole}
              utterance={utterance}
              isSelected={isSelected}
              onUtteranceClicked={onUtteranceClicked}
            />
          );
        })}
      </div>
      <div className="py-8 w-2/5 h-full">
        <SessionViewerDetails
          session={session}
          utteranceCount={utteranceCount}
          annotatedUtteranceCount={annotatedUtteranceCount}
        />
        {sessionFile.annotations && sessionFile.annotations.length > 0 && (
          <div className="p-4">
            <div className="text-muted-foreground mb-2">
              Session annotations
            </div>
            {map(sessionFile.annotations, (annotation) => {
              return (
                <SessionViewerAnnotation
                  key={annotation._id}
                  annotation={annotation}
                  isVoting={isVoting}
                  onDownVoteClicked={() => onDownVoteClicked(annotation._id)}
                  onUpVoteClicked={() => onUpVoteClicked(annotation._id)}
                />
              );
            })}
          </div>
        )}
        {annotatedUtteranceCount > 0 && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
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
                  Jump to first annotation
                </Button>
                {hasSelectedAnnotation && (
                  <div className="text-sm text-muted-foreground">
                    Annotation {selectedUtteranceIndex + 1} of{" "}
                    {annotatedUtteranceCount}
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
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNextAnnotationClicked}
                    disabled={
                      !hasSelectedAnnotation ||
                      selectedUtteranceIndex == annotatedUtteranceCount - 1
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            {map(selectedUtteranceAnnotations, (annotation) => {
              return (
                <SessionViewerAnnotation
                  key={annotation._id}
                  annotation={annotation}
                  isVoting={isVoting}
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
