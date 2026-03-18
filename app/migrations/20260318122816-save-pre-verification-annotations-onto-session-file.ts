import fse from "fs-extra";
import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";

export default {
  id: "20260318122816-save-pre-verification-annotations-onto-session-file",
  name: "Save Pre Verification Annotations Onto Session File",
  description:
    "Moves preVerificationAnnotations from .metadata.json files into the session JSON files",

  async up(db: Db): Promise<MigrationResult> {
    console.log(
      "Starting Save Pre Verification Annotations Onto Session File migration...",
    );

    const storage = getStorageAdapter();

    const runs = await db
      .collection("runs")
      .find(
        { shouldRunVerification: true, isComplete: true },
        { projection: { _id: 1, project: 1, sessions: 1 } },
      )
      .toArray();

    console.log(
      `Found ${runs.length} completed runs with verification enabled`,
    );

    let migrated = 0;
    let failed = 0;

    for (const run of runs) {
      for (const session of run.sessions) {
        const sessionDoc = await db
          .collection("sessions")
          .findOne(
            { _id: session.sessionId },
            { projection: { _id: 1, name: 1 } },
          );

        if (!sessionDoc) {
          console.log(`Session ${session.sessionId} not found, skipping`);
          continue;
        }

        const outputFolder = `storage/${run.project}/runs/${run._id}/${sessionDoc._id}`;
        const fileNameWithoutExtension = sessionDoc.name.replace(/\.json$/, "");
        const metadataPath = `${outputFolder}/${fileNameWithoutExtension}.metadata.json`;
        const sessionFilePath = `${outputFolder}/${sessionDoc.name}`;

        try {
          const metadataLocalPath = await storage.download({
            sourcePath: metadataPath,
          });
          const metadataRaw = await fse.readFile(metadataLocalPath, "utf-8");
          const metadata = JSON.parse(metadataRaw);

          const preVerificationAnnotations =
            metadata?.verification?.[0]?.annotations;

          if (!preVerificationAnnotations) {
            console.log(
              `No preVerificationAnnotations in ${metadataPath}, skipping`,
            );
            continue;
          }

          const sessionLocalPath = await storage.download({
            sourcePath: sessionFilePath,
          });
          const sessionRaw = await fse.readFile(sessionLocalPath, "utf-8");
          const sessionJSON = JSON.parse(sessionRaw);

          sessionJSON.preVerificationAnnotations = preVerificationAnnotations;

          const buffer = Buffer.from(JSON.stringify(sessionJSON));
          await storage.upload({
            file: { buffer, size: buffer.length, type: "application/json" },
            uploadPath: sessionFilePath,
          });

          await storage.remove({ sourcePath: metadataPath });

          migrated++;
          console.log(
            `Migrated preVerificationAnnotations for session ${sessionDoc._id} in run ${run._id}`,
          );
        } catch (error) {
          if (
            error instanceof Error &&
            (error.message.includes("ENOENT") ||
              error.message.includes("NoSuchKey") ||
              error.message.includes("does not exist"))
          ) {
            console.log(`No metadata file at ${metadataPath}, skipping`);
            continue;
          }
          failed++;
          console.log(
            `Failed to migrate session ${sessionDoc._id} in run ${run._id}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }

    console.log(
      `\n✓ Migration complete: ${migrated} migrated, ${failed} failed`,
    );

    return {
      success: failed === 0,
      message: `Migrated preVerificationAnnotations for ${migrated} sessions (${failed} failed)`,
      stats: { migrated, failed },
    };
  },
} satisfies MigrationFile;
