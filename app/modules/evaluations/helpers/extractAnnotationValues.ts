export default function extractAnnotationValues(
  sessionJSON: any,
  annotationType: string,
  fieldKey: string,
): string[] {
  if (annotationType === "PER_SESSION") {
    const annotations = sessionJSON.annotations || [];
    return annotations.map((annotation: any) => {
      const value = annotation[fieldKey];
      return value !== undefined && value !== null ? String(value) : "";
    });
  }

  const transcript = sessionJSON.transcript || [];
  return transcript.flatMap((utterance: any) => {
    const annotations = utterance.annotations || [];
    return annotations.map((annotation: any) => {
      const value = annotation[fieldKey];
      return value !== undefined && value !== null ? String(value) : "";
    });
  });
}
