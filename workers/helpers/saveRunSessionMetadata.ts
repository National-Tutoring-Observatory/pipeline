import getStorageAdapter from "../../app/modules/storage/helpers/getStorageAdapter";

interface VerificationEntry {
  annotations: any[];
  createdAt: string;
}

interface RunSessionMetadata {
  verification: VerificationEntry[];
}

export default async function saveRunSessionMetadata({
  outputFolder,
  outputFileName,
  preVerificationAnnotations,
}: {
  outputFolder: string;
  outputFileName: string;
  preVerificationAnnotations: any[];
}) {
  const metadata: RunSessionMetadata = {
    verification: [
      {
        annotations: preVerificationAnnotations,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  const buffer = Buffer.from(JSON.stringify(metadata));
  const storage = getStorageAdapter();

  await storage.upload({
    file: { buffer, size: buffer.length, type: "application/json" },
    uploadPath: `${outputFolder}/${outputFileName}.metadata.json`,
  });
}
