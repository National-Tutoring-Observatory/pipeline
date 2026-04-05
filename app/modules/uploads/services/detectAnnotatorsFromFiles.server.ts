import extractAnnotationCsvMeta from "~/modules/humanAnnotations/helpers/extractAnnotationCsvMeta";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";

export interface AnnotatorMeta {
  headers: string[];
  annotators: string[];
  csvPath: string;
}

export default async function detectAnnotatorsFromFiles({
  files,
  projectId,
}: {
  files: File[];
  projectId: string;
}): Promise<AnnotatorMeta | null> {
  for (const file of files) {
    if (!file.name.endsWith(".csv")) continue;

    const text = await file.text();
    const meta = extractAnnotationCsvMeta(text);

    if (meta.annotators.length === 0) continue;

    console.log(
      `[detectAnnotatorsFromFiles] Detected human annotations in "${file.name}": annotators=${meta.annotators.join(", ")}, fields=${meta.annotationFields.join(", ")}`,
    );

    const csvBuffer = Buffer.from(text);
    const csvPath = `storage/${projectId}/uploads/${file.name}`;
    const storage = getStorageAdapter();
    await storage.upload({
      file: { buffer: csvBuffer, size: csvBuffer.length, type: "text/csv" },
      uploadPath: csvPath,
    });

    return {
      headers: meta.headers,
      annotators: meta.annotators,
      csvPath,
    };
  }

  return null;
}
