import { useState } from "react";
import annotationTypes from "../annotationTypes";
import AnnotationTypeSelector from "../components/annotationTypeSelector";

export default function AnnotationTypeSelectorContainer({
  annotationType,
  onSelectedAnnotationTypeChanged,
}: {
  annotationType: string;
  onSelectedAnnotationTypeChanged: (annotationType: string) => void;
}) {
  const [isAnnotationTypesOpen, setIsAnnotationTypesOpen] = useState(false);

  const onToggleAnnotationTypePopover = (isAnnotationTypesOpen: boolean) => {
    setIsAnnotationTypesOpen(isAnnotationTypesOpen);
  };

  return (
    <AnnotationTypeSelector
      annotationTypes={annotationTypes}
      annotationType={annotationType}
      isAnnotationTypesOpen={isAnnotationTypesOpen}
      onToggleAnnotationTypePopover={onToggleAnnotationTypePopover}
      onSelectedAnnotationTypeChanged={onSelectedAnnotationTypeChanged}
    />
  );
}
