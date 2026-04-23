import mongoose from "mongoose";
import { RunModel } from "../run";

export interface AggregateProgressResult {
  completedRuns: number;
  erroredRuns: number;
  totalSessions: number;
  completedSessions: number;
  processing: number;
  startedAt: string | null;
}

export default async function aggregateProgress(
  runIds: string[],
): Promise<AggregateProgressResult> {
  const objectIds = runIds.map((id) => new mongoose.Types.ObjectId(id));
  const matchStage = { $match: { _id: { $in: objectIds } } };

  const [progressResult, earliestResult] = await Promise.all([
    RunModel.aggregate([
      matchStage,
      {
        $group: {
          _id: null,
          completedRuns: {
            $sum: { $cond: ["$isComplete", 1, 0] },
          },
          erroredRuns: {
            $sum: { $cond: ["$hasErrored", 1, 0] },
          },
          processing: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isComplete", false] },
                    {
                      $or: [
                        { $eq: [{ $type: "$stoppedAt" }, "missing"] },
                        { $eq: ["$stoppedAt", null] },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
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
    ]),
    RunModel.aggregate([
      matchStage,
      { $match: { startedAt: { $exists: true, $ne: null } } },
      { $sort: { startedAt: 1 } },
      { $limit: 1 },
      { $project: { startedAt: 1 } },
    ]),
  ]);

  const progress = progressResult[0];
  const earliest = earliestResult[0];

  return {
    completedRuns: progress?.completedRuns ?? 0,
    erroredRuns: progress?.erroredRuns ?? 0,
    totalSessions: progress?.totalSessions ?? 0,
    completedSessions: progress?.completedSessions ?? 0,
    processing: progress?.processing ?? 0,
    startedAt: earliest ? String(earliest.startedAt) : null,
  };
}
