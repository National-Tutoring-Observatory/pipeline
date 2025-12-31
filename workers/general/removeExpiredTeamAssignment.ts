import type { Job } from 'bullmq';
import { UserService } from '~/modules/users/user';

export default async function removeExpiredTeamAssignment(job: Job) {
  const { userId, teamId } = job.data || {};
  if (!userId || !teamId) return { status: 'ERRORED', message: 'Missing userId or teamId' };

  await UserService.removeTeam(userId, teamId);

  return { status: 'OK', message: 'Team assignment removed' };
}
