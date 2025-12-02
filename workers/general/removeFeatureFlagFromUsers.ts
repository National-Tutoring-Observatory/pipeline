import type { Job } from "bullmq";
import pull from 'lodash/pull';
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import emitFromJob from "../helpers/emitFromJob";

export default async function removeFeatureFlagFromUsers(job: Job) {
  const { featureFlagName, featureFlagId } = job.data || {};
  if (!featureFlagName) {
    return { status: 'ERRORED', message: 'missing featureFlagName' };
  }

  const documents = getDocumentsAdapter();

  try {
    const result = await documents.getDocuments<any>({ collection: 'users', match: { featureFlags: { $in: [featureFlagName] } } });
    const users = result.data || [];

    for (const user of users) {
      try {
        if (user.featureFlags && Array.isArray(user.featureFlags)) {
          pull(user.featureFlags, featureFlagName);
          await documents.updateDocument({ collection: 'users', match: { _id: user._id }, update: { featureFlags: user.featureFlags } });
        }
      } catch (err) {
        console.warn('[removeFeatureFlagFromUsers] failed to update user', user._id, err);
      }
    }

    try {
      await emitFromJob(job as any, { featureFlagId }, 'FINISHED');
    } catch (err) {
      console.warn('[removeFeatureFlagFromUsers] failed to emit FINISHED', err);
    }

    return { status: 'DELETED', featureFlagId };
  } catch (error) {
    console.error('[removeFeatureFlagFromUsers] error', error);
    // @ts-ignore
    throw new Error(error);
  }
}
