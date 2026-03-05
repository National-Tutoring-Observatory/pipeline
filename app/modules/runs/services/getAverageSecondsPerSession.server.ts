import mongoose from "mongoose";

const RunModel = mongoose.models.Run;

export default async function getAverageSecondsPerSession(
  projectId: string,
): Promise<number | null> {
  const result = await RunModel.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        isComplete: true,
        startedAt: { $exists: true },
        finishedAt: { $exists: true },
      },
    },
    { $sort: { finishedAt: -1 } },
    { $limit: 50 },
    {
      $project: {
        // $subtract gives ms. Divide by 1000 to get seconds.
        // Verification runs do 2 LLM calls per session, so divide by 2000
        // instead to normalize everything to a single-call baseline.
        durationSeconds: {
          $divide: [
            { $subtract: ["$finishedAt", "$startedAt"] },
            {
              $cond: [
                { $ifNull: ["$shouldRunVerification", false] },
                2000,
                1000,
              ],
            },
          ],
        },
        sessionCount: { $size: "$sessions" },
      },
    },
    { $match: { durationSeconds: { $gt: 0 }, sessionCount: { $gt: 0 } } },
    {
      $group: {
        _id: null,
        totalSeconds: { $sum: "$durationSeconds" },
        totalSessions: { $sum: "$sessionCount" },
      },
    },
  ]);

  if (result.length === 0 || result[0].totalSessions === 0) return null;

  return result[0].totalSeconds / result[0].totalSessions;
}
