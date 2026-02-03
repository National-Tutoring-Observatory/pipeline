import mongoose from "mongoose";
import runSchema from "~/lib/schemas/run.schema";
import type { Run } from "~/modules/runs/runs.types";

const RunModel =
  mongoose.models.Run || mongoose.model("Run", runSchema);

export default async function createTestRun(
  data: Partial<Run>,
): Promise<Run> {
  const doc = await RunModel.create(data);
  return doc.toJSON({ flattenObjectIds: true });
}
