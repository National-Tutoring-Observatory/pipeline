export const ANNOTATION_TYPES = {
  PER_UTTERANCE: "Per utterance",
  PER_SESSION: "Per session",
} as const;

export type AnnotationType = keyof typeof ANNOTATION_TYPES;

export const annotationTypeOptions: { value: AnnotationType; label: string }[] =
  Object.entries(ANNOTATION_TYPES).map(([value, label]) => ({
    value: value as AnnotationType,
    label,
  }));

export function isAnnotationType(v: string): v is AnnotationType {
  return v in ANNOTATION_TYPES;
}

export function getAnnotationLabel(type: string): string {
  if (isAnnotationType(type)) {
    return ANNOTATION_TYPES[type];
  }
  return type;
}

export default ANNOTATION_TYPES;
