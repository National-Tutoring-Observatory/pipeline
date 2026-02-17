import { Label } from "@/components/ui/label";
import type { AnnotationSchemaFieldCount } from "../helpers/getAnnotationSchemaFieldCounts";
import EvaluationCreateAnnotationSchemaDisplay from "./evaluationCreateAnnotationSchemaDisplay";
import EvaluationCreateBaseRunSelector from "./evaluationCreateBaseRunSelector";
import EvaluationCreateCompatibleRunsSelector from "./evaluationCreateCompatibleRunsSelector";

export default function EvaluationCreateRunsSelector({
  runs,
  baseRun,
  compatibleRuns,
  selectedRuns,
  annotationSchemaFieldCounts,
  onBaseRunChanged,
  onSelectedRunsChanged,
}: {
  runs: Array<{ _id: string; name: string }>;
  baseRun: string | null;
  compatibleRuns: Array<{ _id: string; name: string }>;
  selectedRuns: string[];
  annotationSchemaFieldCounts: AnnotationSchemaFieldCount[];
  onBaseRunChanged: (id: string | null) => void;
  onSelectedRunsChanged: (ids: string[]) => void;
}) {
  return (
    <div className="max-w-6xl">
      <div className="space-y-2">
        <Label>Select your runs for evaluation</Label>

        <div className="rounded-md border">
          <div className="grid grid-cols-2">
            <EvaluationCreateBaseRunSelector
              runs={runs}
              baseRun={baseRun}
              onBaseRunChanged={onBaseRunChanged}
            />
            <EvaluationCreateCompatibleRunsSelector
              baseRun={baseRun}
              compatibleRuns={compatibleRuns}
              selectedRuns={selectedRuns}
              onSelectedRunsChanged={onSelectedRunsChanged}
            />
          </div>
        </div>

        <EvaluationCreateAnnotationSchemaDisplay
          fieldCounts={annotationSchemaFieldCounts}
        />
      </div>
    </div>
  );
}
