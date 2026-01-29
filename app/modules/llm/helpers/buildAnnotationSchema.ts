interface AnnotationSchemaObject {
  annotations: Array<Record<string, any>>;
}

function getJsonSchemaType(value: any): string {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object" && value !== null) return "object";
  return "string";
}

export default function buildAnnotationSchema(
  annotationSchema: AnnotationSchemaObject,
): object {
  const exampleAnnotation = annotationSchema?.annotations?.[0];

  if (!exampleAnnotation) {
    throw new Error(
      "buildAnnotationSchema: expected annotationSchema.annotations[0] to exist",
    );
  }

  const properties: Record<string, { type: string }> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(exampleAnnotation)) {
    properties[key] = {
      type: getJsonSchemaType(value),
    };
    required.push(key);
  }

  return {
    type: "object",
    properties: {
      annotations: {
        type: "array",
        items: {
          type: "object",
          properties,
          required,
        },
      },
    },
    required: ["annotations"],
  };
}
