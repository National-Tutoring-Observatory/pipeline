import fse from "fs-extra";
import { encode } from "gpt-tokenizer";
import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import getConversationFromJSON from "../../workers/helpers/getConversationFromJSON";

export default {
  id: "20260326101657-backfill-session-input-tokens",
  name: "Backfill Session Input Tokens",
  description:
    "Tokenize already-converted session files and store inputTokens on the session document",

  async up(db: Db): Promise<MigrationResult> {
    console.log("Starting Backfill Session Input Tokens migration...");

    const storage = getStorageAdapter();

    const sessions = await db
      .collection("sessions")
      .find(
        { hasConverted: true, inputTokens: { $exists: false } },
        { projection: { _id: 1, name: 1, project: 1 } },
      )
      .toArray();

    console.log(`Found ${sessions.length} sessions without inputTokens`);

    let migrated = 0;
    let failed = 0;

    for (const session of sessions) {
      const filePath = `storage/${session.project}/preAnalysis/${session._id}/${session.name}`;

      try {
        const localPath = await storage.download({ sourcePath: filePath });
        const json = await fse.readJSON(localPath);
        const inputTokens = encode(getConversationFromJSON(json)).length;

        await db
          .collection("sessions")
          .updateOne({ _id: session._id }, { $set: { inputTokens } });

        console.log(`  ✓ Session ${session._id}: ${inputTokens} tokens`);
        migrated++;
      } catch (error) {
        console.error(
          `  ❌ Session ${session._id} (${filePath}): ${error instanceof Error ? error.message : String(error)}`,
        );
        failed++;
      }
    }

    console.log(
      `\n✓ Migration complete: ${migrated} backfilled, ${failed} failed`,
    );

    return {
      success: failed === 0,
      message: `Backfilled inputTokens for ${migrated} sessions (${failed} failed)`,
      stats: { migrated, failed },
    };
  },
} satisfies MigrationFile;
