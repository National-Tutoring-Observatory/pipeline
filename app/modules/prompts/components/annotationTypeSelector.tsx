import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import map from 'lodash/map';
import type { AnnotationType } from "../prompts.types";

export default function AnnotationTypeSelector({
  annotationTypes,
  annotationType,
  onSelectedAnnotationTypeChanged
}: {
  annotationTypes: AnnotationType[],
  annotationType: string,
  isAnnotationTypesOpen: boolean,
  onToggleAnnotationTypePopover: (isPromptsOpen: boolean) => void,
  onSelectedAnnotationTypeChanged: (selectedPrompt: string) => void,
}) {
  return (
    <Select
      value={annotationType}
      onValueChange={(annotationType: string) => {
        onSelectedAnnotationTypeChanged(annotationType);
      }}
    >
      <SelectTrigger id="annotation-type" className="w-[180px]">
        <SelectValue placeholder="Select an annotation type" />
      </SelectTrigger>
      <SelectContent>
        {map(annotationTypes, (annotationTypeItem) => {
          return (
            <SelectItem
              key={annotationTypeItem.value}
              value={annotationTypeItem.value}>
              {annotationTypeItem.name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  )
}