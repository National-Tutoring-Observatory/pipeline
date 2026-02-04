import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { AlertCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router";

export default function EvaluationCreate({
  name,
  isSubmitting,
  isAbleToCreateEvaluation,
  projectId,
  collectionId,
  runs,
  selectedRuns,
  onNameChanged,
  onSelectedRunsChanged,
  onSubmit,
  onCancel,
}: {
  name: string;
  isSubmitting: boolean;
  isAbleToCreateEvaluation: boolean;
  projectId: string;
  collectionId: string;
  runs: Array<{ _id: string; name: string }>;
  selectedRuns: string[];
  onNameChanged: (value: string) => void;
  onSelectedRunsChanged: (ids: string[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  if (!isAbleToCreateEvaluation) {
    return (
      <div className="max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Unable to create evaluation</AlertTitle>
          <AlertDescription>
            At least 2 runs are required to create an evaluation.{" "}
            <Link
              to={`/projects/${projectId}/collections/${collectionId}`}
              className="underline"
            >
              Back to collection
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-md border">
        <div className="grid grid-cols-2">
          <div className="border-r p-4">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Select your base run
            </Label>
            <ItemGroup className="mt-3">
              {runs.map((run) => (
                <Item
                  key={run._id}
                  variant="default"
                  size="sm"
                  className="cursor-pointer hover:bg-accent"
                >
                  <ItemContent>
                    <ItemTitle>{run.name}</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <ChevronRight className="text-muted-foreground size-4" />
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </div>
          <div className="p-4">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Select your comparison runs
            </Label>
            <ItemGroup className="mt-3">
              {runs.map((run) => (
                <Item
                  key={run._id}
                  variant="default"
                  size="sm"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => {
                    if (selectedRuns.includes(run._id)) {
                      onSelectedRunsChanged(
                        selectedRuns.filter((id) => id !== run._id),
                      );
                    } else {
                      onSelectedRunsChanged([...selectedRuns, run._id]);
                    }
                  }}
                >
                  <Checkbox
                    id={`right-${run._id}`}
                    checked={selectedRuns.includes(run._id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onSelectedRunsChanged([...selectedRuns, run._id]);
                      } else {
                        onSelectedRunsChanged(
                          selectedRuns.filter((id) => id !== run._id),
                        );
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <ItemContent>
                    <ItemTitle>{run.name}</ItemTitle>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Evaluation Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChanged(e.target.value)}
          placeholder="Enter evaluation name"
        />
      </div>

      <div className="flex gap-4">
        <Button onClick={onSubmit} disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? "Creating..." : "Create Evaluation"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
