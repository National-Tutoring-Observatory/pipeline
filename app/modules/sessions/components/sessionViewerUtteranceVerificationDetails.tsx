import { Button } from "@/components/ui/button";
import { BadgeCheck, MinusCircle, PlusCircle } from "lucide-react";

export default function SessionViewerUtteranceVerificationDetails({
  hasChangedAnnotation,
  hasAddedAnnotation,
  hasRemovedAnnotation,
  onUtteranceClicked,
}: {
  hasChangedAnnotation?: boolean;
  hasAddedAnnotation?: boolean;
  hasRemovedAnnotation?: boolean;
  onUtteranceClicked: () => void;
}) {
  return (
    <>
      {hasChangedAnnotation && (
        <div className="text-muted-foreground ml-2 flex items-center text-xs">
          <BadgeCheck className="mr-1 size-3" />
          Changed by verification
        </div>
      )}
      {hasAddedAnnotation && (
        <div className="text-muted-foreground ml-2 flex items-center text-xs">
          <PlusCircle className="mr-1 size-3" />
          Added by verification
        </div>
      )}
      {hasRemovedAnnotation && (
        <Button
          variant="link"
          size={"sm"}
          className="text-destructive decoration-destructive ml-4"
          onClick={onUtteranceClicked}
        >
          <div className="text-destructive flex items-center text-xs">
            <MinusCircle className="mr-1 size-3" />
            Removed by verification
          </div>
        </Button>
      )}
    </>
  );
}
