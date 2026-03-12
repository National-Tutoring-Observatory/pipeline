import type { CodebookCategory } from "../codebooks.types";

const SYSTEM_FIELDS = [
  { isSystem: true, fieldKey: "_id", fieldType: "string", value: "" },
  {
    isSystem: true,
    fieldKey: "identifiedBy",
    fieldType: "string",
    value: "AI",
  },
  { isSystem: true, fieldKey: "reasoning", fieldType: "string", value: "" },
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_");
}

export function buildAnnotationSchemaFromCategories(
  categories: CodebookCategory[],
) {
  const fields = [...SYSTEM_FIELDS];

  for (const category of categories) {
    if (category.codes.length === 0) continue;

    fields.push({
      isSystem: false,
      fieldKey: slugify(category.name),
      fieldType: "string",
      value: "",
      codes: category.codes.map((c) => c.code),
    } as any);
  }

  return fields;
}

export function buildCodebookSummary({
  codebookName,
  codebookDescription,
  categories,
}: {
  codebookName: string;
  codebookDescription: string;
  categories: CodebookCategory[];
}): string {
  const lines: string[] = [];

  lines.push(`Codebook: ${codebookName}`);
  if (codebookDescription) {
    lines.push(`Intent: ${codebookDescription}`);
  }
  lines.push("");

  for (const category of categories) {
    lines.push(`## ${category.name}`);
    if (category.description) {
      lines.push(category.description);
    }
    lines.push("");

    for (const code of category.codes) {
      lines.push(`### ${code.code}`);
      if (code.definition) {
        lines.push(code.definition);
      }

      const examplesByType = groupExamplesByType(code.examples);
      for (const [type, examples] of Object.entries(examplesByType)) {
        for (const example of examples) {
          lines.push(`- ${type}: "${example.example}"`);
        }
      }

      lines.push("");
    }
  }

  return lines.join("\n").trim();
}

function groupExamplesByType(
  examples: { example: string; exampleType: string }[],
) {
  const grouped: Record<string, { example: string; exampleType: string }[]> =
    {};

  for (const ex of examples) {
    if (!grouped[ex.exampleType]) {
      grouped[ex.exampleType] = [];
    }
    grouped[ex.exampleType].push(ex);
  }

  return grouped;
}
