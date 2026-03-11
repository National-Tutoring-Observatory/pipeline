export default function extractAnnotationValues(
  sessionJSON: any,
  annotationType: string,
  fieldKey: string,
): string[] {
  if (annotationType === "PER_SESSION") {
    const annotations = sessionJSON.annotations || [];
    const match = annotations.find(
      (a: any) => a[fieldKey] !== undefined && a[fieldKey] !== null,
    );
    return match ? [String(match[fieldKey])] : [""];
  }

  const transcript = sessionJSON.transcript || [];
  return transcript.map((utterance: any) => {
    const annotations = utterance.annotations || [];
    const match = annotations.find(
      (a: any) => a[fieldKey] !== undefined && a[fieldKey] !== null,
    );
    return match ? String(match[fieldKey]) : "";
  });
}
