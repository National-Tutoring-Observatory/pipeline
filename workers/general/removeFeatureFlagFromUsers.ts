import type { Job } from "bullmq";
import { UserService } from "~/modules/users/user";
import emitFromJob from "../helpers/emitFromJob";

export default async function removeFeatureFlagFromUsers(job: Job) {
  const { featureFlagName, featureFlagId } = job.data || {};
  if (!featureFlagName) {
    return { status: "ERRORED", message: "missing featureFlagName" };
  }

  try {
    await UserService.removeFeatureFlag(featureFlagName);

    try {
      await emitFromJob(job as any, { featureFlagId }, "FINISHED");
    } catch (err) {
      console.warn("[removeFeatureFlagFromUsers] failed to emit FINISHED", err);
    }

    return { status: "DELETED", featureFlagId };
  } catch (error) {
    console.error("[removeFeatureFlagFromUsers] error", error);
    // @ts-ignore
    throw new Error(error);
  }
}
