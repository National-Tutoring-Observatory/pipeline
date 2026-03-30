import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";
import tokenizePromptVersion from "~/modules/prompts/helpers/tokenizePromptVersion";

export default {
  id: "20260330102322-backfill-prompt-version-input-tokens",
  name: "Backfill Prompt Version Input Tokens",
  description:
    "Tokenize saved prompt versions and store inputTokens for cost estimation",

  async up(db: Db): Promise<MigrationResult> {
    console.log("Starting Backfill Prompt Version Input Tokens migration...");

    const versions = await db
      .collection("promptversions")
      .find(
        { hasBeenSaved: true, inputTokens: { $exists: false } },
        { projection: { _id: 1, userPrompt: 1, annotationSchema: 1 } },
      )
      .toArray();

    console.log(`Found ${versions.length} prompt versions without inputTokens`);

    let migrated = 0;
    let failed = 0;

    for (const version of versions) {
      try {
        const inputTokens = tokenizePromptVersion(
          version.userPrompt ?? "",
          version.annotationSchema ?? [],
        );

        await db
          .collection("promptversions")
          .updateOne({ _id: version._id }, { $set: { inputTokens } });

        console.log(`  ✓ PromptVersion ${version._id}: ${inputTokens} tokens`);
        migrated++;
      } catch (error) {
        console.error(
          `  ❌ PromptVersion ${version._id}: ${error instanceof Error ? error.message : String(error)}`,
        );
        failed++;
      }
    }

    console.log(
      `\n✓ Migration complete: ${migrated} backfilled, ${failed} failed`,
    );

    return {
      success: failed === 0,
      message: `Backfilled inputTokens for ${migrated} prompt versions (${failed} failed)`,
      stats: { migrated, failed },
    };
  },
} satisfies MigrationFile;
