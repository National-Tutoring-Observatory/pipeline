import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import annotationTypes from "~/modules/prompts/annotationTypes";

export default function CollectionAnnotationType({
  annotationType,
  onAnnotationTypeChanged,
}: {
  annotationType: string;
  onAnnotationTypeChanged: (type: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="font-bold" htmlFor="annotationType">
        Annotation Type
      </Label>
      <Select value={annotationType} onValueChange={onAnnotationTypeChanged}>
        <SelectTrigger id="annotationType">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {annotationTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
