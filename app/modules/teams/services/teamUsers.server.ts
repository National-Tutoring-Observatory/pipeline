import { UserService } from '~/modules/users/user';
import { AuditService } from '~/modules/audits/audit';
import getQueue from '~/modules/queues/helpers/getQueue';
import type { TeamAssignmentOption } from '../teams.types';

const MS_IN_A_DAY = 86400000;

export async function addSuperAdminToTeam({ teamId, userId, performedByUserId, reason, option, delayMs = MS_IN_A_DAY }: {
  teamId: string,
  userId: string,
  performedByUserId: string,
  reason: string,
  option: TeamAssignmentOption,
  delayMs?: number
}) {
  const userDoc = await UserService.findById(userId);
  if (!userDoc) throw new Error('User not found');
  if (!userDoc.teams) userDoc.teams = [];
  if (userDoc.teams.some((t: any) => t.team === teamId)) {
    throw new Error('User is already a member of the team');
  }

  const temporary = option === 'temporary';

  userDoc.teams.push({ team: teamId, role: 'ADMIN' });

  await UserService.updateById(userId, { teams: userDoc.teams as any });

  await AuditService.create({
    action: 'SUPERADMIN_REQUEST_TEAM_ADMIN',
    performedBy: performedByUserId,
    context: {
      target: userId,
      team: teamId,
      reason,
      option,
      temporary,
    }
  });

  if (temporary) {
    const queue = getQueue('general');
    await queue.add('REMOVE_EXPIRED_TEAM_ASSIGNMENT', { userId, teamId }, { delay: delayMs });
  }

  return { ok: true };
}
