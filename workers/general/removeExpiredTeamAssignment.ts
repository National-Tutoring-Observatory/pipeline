import getDocumentsAdapter from 'app/modules/documents/helpers/getDocumentsAdapter';
import type { Job } from 'bullmq';
import type { User } from '~/modules/users/users.types';

export default async function removeExpiredTeamAssignment(job: Job) {
  const { userId, teamId } = job.data || {};
  if (!userId || !teamId) return { status: 'ERRORED', message: 'Missing userId or teamId' };

  const documents = getDocumentsAdapter();
  const userDoc = await documents.getDocument<User>({ collection: 'users', match: { _id: userId } });
  if (!userDoc.data) return { status: 'OK', message: 'User not found' };

  if (!Array.isArray(userDoc.data.teams)) return { status: 'OK', message: 'No teams on user' };

  const newTeams = userDoc.data.teams.filter((t: any) => t.team !== teamId);
  await documents.updateDocument({ collection: 'users', match: { _id: userId }, update: { teams: newTeams } });

  return { status: 'OK', message: 'Team assignment removed' };
}
