interface AnnotationSchemaObject {
  annotations: Array<Record<string, any>>;
}

interface SchemaItem {
  fieldKey: string;
  codes?: string[];
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
  schemaItems?: SchemaItem[],
): object {
  const exampleAnnotation = annotationSchema?.annotations?.[0];

  if (!exampleAnnotation) {
    throw new Error(
      "buildAnnotationSchema: expected annotationSchema.annotations[0] to exist",
    );
  }

  const codesMap: Record<string, string[]> = {};
  if (schemaItems) {
    for (const item of schemaItems) {
      if (item.codes && item.codes.length > 0) {
        codesMap[item.fieldKey] = item.codes;
      }
    }
  }

  const properties: Record<string, { type: string; enum?: string[] }> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(exampleAnnotation)) {
    const property: { type: string; enum?: string[] } = {
      type: getJsonSchemaType(value),
    };
    if (codesMap[key]) {
      property.enum = codesMap[key];
    }
    properties[key] = property;
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
