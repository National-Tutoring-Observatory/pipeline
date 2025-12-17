/**
 * Migration: Add snapshots to runs without them
 * Description: Builds RunSnapshot objects for all runs that have completed setup but lack snapshots
 * This ensures backward compatibility with runs created before the snapshot feature
 */

export const up = async (db, client) => {
  console.log('Starting migration: add-run-snapshots');

  const runsCollection = db.collection('runs');
  const promptVersionsCollection = db.collection('promptversions');

  try {
    // Find all runs that have setup but no snapshot
    const runsWithoutSnapshots = await runsCollection
      .find({
        hasSetup: true,
        snapshot: { $exists: false }
      })
      .toArray();

    console.log(`Found ${runsWithoutSnapshots.length} runs without snapshots`);

    let migrated = 0;
    let failed = 0;

    for (const run of runsWithoutSnapshots) {
      try {
        // Fetch the prompt version that was used
        const promptVersion = await promptVersionsCollection.findOne({
          prompt: run.prompt,
          version: Number(run.promptVersion)
        });

        if (!promptVersion) {
          console.warn(`⚠ Prompt version not found for run ${run._id}: prompt=${run.prompt}, version=${run.promptVersion}`);
          failed++;
          continue;
        }

        // Fetch the complete prompt object
        const promptsCollection = db.collection('prompts');
        const prompt = await promptsCollection.findOne({
          _id: run.prompt
        });

        if (!prompt) {
          console.warn(`⚠ Prompt not found for run ${run._id}: prompt=${run.prompt}`);
          failed++;
          continue;
        }

        // Build snapshot with complete objects
        const snapshot = {
          prompt,
          promptVersion
        };

        // Update run with snapshot
        const result = await runsCollection.updateOne(
          { _id: run._id },
          { $set: { snapshot } }
        );

        if (result.modifiedCount === 1) {
          migrated++;
          console.log(`✓ Migrated run ${run._id}`);
        } else {
          failed++;
          console.warn(`⚠ Failed to update run ${run._id}`);
        }
      } catch (error) {
        failed++;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`✗ Error migrating run ${run._id}: ${message}`);
      }
    }

    console.log(`\n✓ Migration complete: ${migrated} succeeded, ${failed} failed`);

    if (failed > 0) {
      console.warn(`\n⚠ ${failed} runs could not be migrated. Check logs above for details.`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Migration failed:', message);
    throw error;
  }
};

export const down = async (db, client) => {
  console.log('Rolling back migration: add-run-snapshots');

  const runsCollection = db.collection('runs');

  try {
    // Remove snapshots from all runs
    const result = await runsCollection.updateMany(
      { snapshot: { $exists: true } },
      { $unset: { snapshot: "" } }
    );

    console.log(`✓ Removed snapshots from ${result.modifiedCount} runs`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Rollback failed:', message);
    throw error;
  }
};
