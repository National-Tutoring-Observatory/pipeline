import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { AnnotationSchemaFieldCount } from "../helpers/getAnnotationSchemaFieldCounts";

export default function EvaluationCreateAnnotationSchemaDisplay({
  fieldCounts,
}: {
  fieldCounts: AnnotationSchemaFieldCount[];
}) {
  if (fieldCounts.length === 0) return null;

  return (
    <div className="mt-4 max-w-lg space-y-2">
      <Label>Annotation schema fields</Label>
      <p className="text-muted-foreground text-sm">
        In your evaluation you will be able to toggle between these fields. The
        count here is how many runs you will be able to compare when evaluating
        each schema field.
      </p>
      <div className="flex flex-wrap gap-2">
        {fieldCounts.map((field) => (
          <div
            key={field.fieldKey}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <span className="font-medium">{field.fieldKey}</span>
            <Badge variant="secondary">{field.fieldType}</Badge>
            <span className="text-muted-foreground">
              {field.matchCount}/{field.total} runs
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
