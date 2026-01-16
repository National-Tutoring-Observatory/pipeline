import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import annotationTypes from "~/modules/prompts/annotationTypes";

const CollectionCreatorAnnotationType = ({
  annotationType,
  onAnnotationTypeChanged
}: {
  annotationType: string,
  onAnnotationTypeChanged: (annotationType: string) => void
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="annotationType">Annotation Type</Label>
      <Select value={annotationType} onValueChange={onAnnotationTypeChanged}>
        <SelectTrigger id="annotationType">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {annotationTypes.map(type => (
            <SelectItem key={type.value} value={type.value}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CollectionCreatorAnnotationType;
