import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EvaluationCreate({
  collectionName,
  name,
  isSubmitting,
  onNameChanged,
  onSubmit,
  onCancel,
}: {
  collectionName: string;
  name: string;
  isSubmitting: boolean;
  onNameChanged: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="collection">Collection</Label>
        <Input id="collection" value={collectionName} disabled />
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
