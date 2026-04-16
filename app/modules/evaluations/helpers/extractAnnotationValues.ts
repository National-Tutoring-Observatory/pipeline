import type {
  Annotation,
  SessionFile,
  Utterance,
} from "~/modules/sessions/sessions.types";

export default function extractAnnotationValues(
  sessionJSON: SessionFile,
  annotationType: string,
  fieldKey: string,
): string[] {
  if (annotationType === "PER_SESSION") {
    const annotations = sessionJSON.annotations || [];
    const match = annotations.find(
      (a: Annotation) => a[fieldKey] !== undefined && a[fieldKey] !== null,
    );
    return match ? [String(match[fieldKey])] : [""];
  }

  const transcript = sessionJSON.transcript || [];
  return transcript.map((utterance: Utterance) => {
    const annotations = utterance.annotations || [];
    const match = annotations.find(
      (a: Annotation) => a[fieldKey] !== undefined && a[fieldKey] !== null,
    );
    return match ? String(match[fieldKey]) : "";
  });
}
