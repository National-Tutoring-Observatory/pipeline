import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';
import { UserService } from '~/modules/users/user';
import getQueue from '~/modules/queues/helpers/getQueue';
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

  const userDoc = await UserService.findById(userId);
  if (!userDoc) throw new Error('User not found');
  if (!userDoc.teams) userDoc.teams = [];
  if (userDoc.teams.some((t: any) => t.team === teamId)) {
    throw new Error('User is already a member of the team');
  }
  if (!isTeamAssignmentOption(option)) {
    throw new Error('Invalid team assignment option');
  }

  const temporary = option === 'temporary';

  userDoc.teams.push({ team: teamId, role: 'ADMIN' });

  await UserService.updateById(userId, { teams: userDoc.teams as any });

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
