import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';
import getQueue from '~/modules/queues/helpers/getQueue';
import type { User } from '~/modules/users/users.types';
import type { TeamAssignmentOption } from '../teams.types';
import { isTeamAssignmentOption } from '../teams.types';

const MS_IN_A_DAY = 86400000;

export async function addSuperAdminToTeam({ teamId, userId, reason, option, delayMs = MS_IN_A_DAY }: {
  teamId: string,
  userId: string,
  reason: string,
  option: TeamAssignmentOption,
  delayMs?: number
}) {
  const documents = getDocumentsAdapter();

  const userDoc = await documents.getDocument<User>({ collection: 'users', match: { _id: userId } });
  if (!userDoc.data) throw new Error('User not found');
  if (!userDoc.data.teams) userDoc.data.teams = [];
  if (userDoc.data.teams.some(t => t.team === teamId)) {
    throw new Error('User is already a member of the team');
  }
  if (!isTeamAssignmentOption(option)) {
    throw new Error('Invalid team assignment option');
  }

  const temporary = option === 'temporary';

  userDoc.data.teams.push({ team: teamId, role: 'ADMIN' });

  await documents.updateDocument({ collection: 'users', match: { _id: userId }, update: { teams: userDoc.data.teams } });

  documents.createDocument({
    collection: 'audits',
    update: {
      action: 'ADD_SUPERADMIN',
      user: userId,
      team: teamId,
      context: {
        reason,
        option,
        temporary,
      }
    }
  });

  if (temporary) {
    const queue = getQueue('general');
    await queue.add('REMOVE_EXPIRED_TEAM_ASSIGNMENT', { userId, teamId }, { delay: delayMs });
  }

  return { ok: true };
}
