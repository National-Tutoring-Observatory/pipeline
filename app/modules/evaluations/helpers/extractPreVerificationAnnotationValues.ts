import type {
  Annotation,
  SessionFile,
  Utterance,
} from "~/modules/sessions/sessions.types";

export default function extractPreVerificationAnnotationValues(
  sessionJSON: SessionFile,
  annotationType: string,
  fieldKey: string,
): string[] {
  const preAnnotations = sessionJSON.preVerificationAnnotations || [];

  if (annotationType === "PER_SESSION") {
    const match = preAnnotations.find(
      (a: Annotation) => a[fieldKey] !== undefined && a[fieldKey] !== null,
    );
    return match ? [String(match[fieldKey])] : [""];
  }

  const preByUtteranceId = new Map<string, Annotation>();
  for (const annotation of preAnnotations) {
    if (annotation._id) {
      preByUtteranceId.set(String(annotation._id), annotation);
    }
  }

  const transcript = sessionJSON.transcript || [];
  return transcript.map((utterance: Utterance) => {
    const annotation = preByUtteranceId.get(String(utterance._id));
    if (!annotation) return "";
    return annotation[fieldKey] !== undefined && annotation[fieldKey] !== null
      ? String(annotation[fieldKey])
      : "";
  });
}
