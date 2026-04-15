import annotationTypes from "../annotationTypes";

const validAnnotationTypes = annotationTypes.map((a) => a.value);

export default function isValidAnnotationType(value: unknown): boolean {
  return typeof value === "string" && validAnnotationTypes.includes(value);
}
