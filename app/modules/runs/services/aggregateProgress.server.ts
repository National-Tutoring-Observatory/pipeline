import mongoose from "mongoose";
import runSchema from "~/lib/schemas/run.schema";

const RunModel = mongoose.models.Run || mongoose.model("Run", runSchema);

export interface AggregateProgressResult {
  completedRuns: number;
  totalSessions: number;
  completedSessions: number;
  running: number;
  startedAt: string | null;
}

export default async function aggregateProgress(
  runIds: string[],
): Promise<AggregateProgressResult> {
  const objectIds = runIds.map((id) => new mongoose.Types.ObjectId(id));
  const [result] = await RunModel.aggregate([
    { $match: { _id: { $in: objectIds } } },
    {
      $facet: {
        progress: [
          {
            $group: {
              _id: null,
              completedRuns: {
                $sum: { $cond: ["$isComplete", 1, 0] },
              },
              running: {
                $sum: { $cond: ["$isRunning", 1, 0] },
              },
              totalSessions: {
                $sum: { $size: "$sessions" },
              },
              completedSessions: {
                $sum: {
                  $size: {
                    $filter: {
                      input: "$sessions",
                      cond: {
                        $in: ["$$this.status", ["DONE", "ERRORED", "STOPPED"]],
                      },
                    },
                  },
                },
              },
            },
          },
        ],
        earliest: [
          { $match: { startedAt: { $exists: true, $ne: null } } },
          { $sort: { startedAt: 1 } },
          { $limit: 1 },
          { $project: { startedAt: 1 } },
        ],
      },
    },
  ]);

  const progress = result?.progress?.[0];
  const earliest = result?.earliest?.[0];

  return {
    completedRuns: progress?.completedRuns ?? 0,
    totalSessions: progress?.totalSessions ?? 0,
    completedSessions: progress?.completedSessions ?? 0,
    running: progress?.running ?? 0,
    startedAt: earliest ? String(earliest.startedAt) : null,
  };
}
