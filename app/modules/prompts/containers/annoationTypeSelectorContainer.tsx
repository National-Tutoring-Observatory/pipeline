import { useState } from "react";
import AnnotationTypeSelector from "../components/annotationTypeSelector";
import annotationTypes from "../annotationTypes";

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
