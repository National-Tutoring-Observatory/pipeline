import { Badge } from "@/components/ui/badge";
import type { Annotation, Utterance } from "../sessions.types";

export default function SessionViewerAnnotation({ annotation }: { annotation: Annotation & any }) {
  return (
    <div className="p-4 bg-muted rounded-md">
      <div className="mb-2">
        <div className="text-xs text-muted-foreground">
          Score
        </div>
        <div>
          {annotation.score}
        </div>
      </div>
      <div className="mb-2">
        <div className="text-xs text-muted-foreground">
          Reasoning
        </div>
        <div>
          {annotation.reasoning}
        </div>
      </div>
      <div>
        <Badge>
          {`Identified by ${annotation.identifiedBy}`}
        </Badge>
      </div>
    </div>
  );
}