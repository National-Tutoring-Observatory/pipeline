import mongoose from "mongoose";
import runSchema from "../../app/lib/schemas/run.schema";
import type { RunSession } from "../../app/modules/runs/runs.types";

const RunModel = mongoose.models.Run || mongoose.model("Run", runSchema);

export default async function updateRunSession({
  runId,
  sessionId,
  update,
}: {
  runId: string;
  sessionId: string;
  update: Partial<RunSession>;
}) {
  // Build dot notation updates for atomic operation
  const setUpdate: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(update)) {
    setUpdate[`sessions.$[elem].${key}`] = value;
  }

  const result = await RunModel.findByIdAndUpdate(
    runId,
    { $set: setUpdate },
    {
      arrayFilters: [{ "elem.sessionId": sessionId }],
      new: true,
    },
  );

  if (!result) {
    throw new Error(`Run not found: ${runId}`);
  }
}
