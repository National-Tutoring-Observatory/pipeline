import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import map from "lodash/map";
import type { AnnotationType } from "../prompts.types";

export default function AnnotationTypeSelector({
  annotationTypes,
  annotationType,
  onSelectedAnnotationTypeChanged,
}: {
  annotationTypes: AnnotationType[];
  annotationType: string;
  isAnnotationTypesOpen: boolean;
  onToggleAnnotationTypePopover: (isPromptsOpen: boolean) => void;
  onSelectedAnnotationTypeChanged: (selectedPrompt: string) => void;
}) {
  return (
    <Tabs
      value={annotationType}
      onValueChange={onSelectedAnnotationTypeChanged}
      className="w-full"
    >
      <TabsList>
        {map(annotationTypes, (annotationTypeItem) => (
          <TabsTrigger
            key={annotationTypeItem.value}
            value={annotationTypeItem.value}
          >
            {annotationTypeItem.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
