import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260225093647-add-reasoning-to-prompt-versions",
  name: "Add Reasoning to Prompt Versions",
  description:
    "Add a reasoning system field to all prompt versions that don't already have one",

  async up(db: Db): Promise<MigrationResult> {
    const collection = db.collection("promptversions");

    const versionsWithoutReasoning = await collection
      .find({
        "annotationSchema.fieldKey": { $ne: "reasoning" },
      })
      .toArray();

    console.log(
      `Found ${versionsWithoutReasoning.length} prompt versions without reasoning field`,
    );

    let migrated = 0;
    let failed = 0;

    for (const version of versionsWithoutReasoning) {
      try {
        const schema = version.annotationSchema || [];

        const identifiedByIndex = schema.findIndex(
          (field: { fieldKey: string }) => field.fieldKey === "identifiedBy",
        );

        const reasoningField = {
          isSystem: true,
          fieldKey: "reasoning",
          fieldType: "string",
          value: "",
        };

        if (identifiedByIndex !== -1) {
          schema.splice(identifiedByIndex + 1, 0, reasoningField);
        } else {
          schema.push(reasoningField);
        }

        await collection.updateOne(
          { _id: version._id },
          { $set: { annotationSchema: schema } },
        );

        console.log(
          `  ✓ Added reasoning to prompt version ${version._id} (v${version.version})`,
        );
        migrated++;
      } catch (error) {
        console.error(
          `  ✗ Failed to update prompt version ${version._id}:`,
          error,
        );
        failed++;
      }
    }

    return {
      success: failed === 0,
      message: `Added reasoning field to ${migrated} prompt versions (${failed} failed)`,
      stats: { migrated, failed },
    };
  },
} satisfies MigrationFile;
