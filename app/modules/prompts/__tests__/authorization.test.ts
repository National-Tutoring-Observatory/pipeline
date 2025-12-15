import { describe, expect, it } from 'vitest';
import type { User } from '~/modules/users/users.types';
import PromptAuthorization from '../authorization';

describe('PromptAuthorization', () => {
  const superAdminUser = {
    _id: 'super-admin-1',
    username: 'super_admin',
    role: 'SUPER_ADMIN',
    teams: ([] as any)
  } as User;

  const teamAdminUser = {
    _id: 'team-admin-1',
    username: 'team_admin',
    role: 'USER',
    teams: [{ team: 'team-1', role: 'ADMIN' }]
  } as User;

  const teamMemberUser = {
    _id: 'team-member-1',
    username: 'team_member',
    role: 'USER',
    teams: [{ team: 'team-1', role: 'MEMBER' }],
  } as User;

  const nonTeamUser = {
    _id: 'non-team-1',
    username: 'non_team',
    role: 'USER',
    teams: ([] as any)
  } as User;

  describe('canCreate', () => {
    it('allows team admins to create prompts in their team', () => {
      expect(PromptAuthorization.canCreate(teamAdminUser, 'team-1')).toBe(true);
    });

    it('denies super admins to create prompts in a team', () => {
      expect(PromptAuthorization.canCreate(superAdminUser, 'team-1')).toBe(false);
    });

    it('denies team members from creating prompts', () => {
      expect(PromptAuthorization.canCreate(teamMemberUser, 'team-1')).toBe(false);
    });

    it('denies non-members from creating prompts', () => {
      expect(PromptAuthorization.canCreate(nonTeamUser, 'team-1')).toBe(false);
    });

    it('denies null users from creating prompts', () => {
      expect(PromptAuthorization.canCreate(null, 'team-1')).toBe(false);
    });
  });

  describe('canView', () => {
    it('allows team members to view prompts in their team', () => {
      expect(PromptAuthorization.canView(teamMemberUser, 'team-1')).toBe(true);
    });

    it('denies super admins to view prompts in a team', () => {
      expect(PromptAuthorization.canView(superAdminUser, 'team-1')).toBe(false);
    });

    it('denies non-members from viewing prompts', () => {
      expect(PromptAuthorization.canView(nonTeamUser, 'team-1')).toBe(false);
    });

    it('denies null users from viewing prompts', () => {
      expect(PromptAuthorization.canView(null, 'team-1')).toBe(false);
    });
  });

  describe('canUpdate', () => {
    it('allows team admins to update prompts in their team', () => {
      expect(PromptAuthorization.canUpdate(teamAdminUser, 'team-1')).toBe(true);
    });

    it('denies super admins to update prompts in a team', () => {
      expect(PromptAuthorization.canUpdate(superAdminUser, 'team-1')).toBe(false);
    });

    it('denies team members from updating prompts', () => {
      expect(PromptAuthorization.canUpdate(teamMemberUser, 'team-1')).toBe(false);
    });

    it('denies non-members from updating prompts', () => {
      expect(PromptAuthorization.canUpdate(nonTeamUser, 'team-1')).toBe(false);
    });

    it('denies null users from updating prompts', () => {
      expect(PromptAuthorization.canUpdate(null, 'team-1')).toBe(false);
    });
  });

  describe('canDelete', () => {
    it('allows team admins to delete prompts in their team', () => {
      expect(PromptAuthorization.canDelete(teamAdminUser, 'team-1')).toBe(true);
    });

    it('denies super admins to delete prompts in a team', () => {
      expect(PromptAuthorization.canDelete(superAdminUser, 'team-1')).toBe(false);
    });

    it('denies non-members from deleting prompts', () => {
      expect(PromptAuthorization.canDelete(nonTeamUser, 'team-1')).toBe(false);
    });

    it('denies null users from deleting prompts', () => {
      expect(PromptAuthorization.canDelete(null, 'team-1')).toBe(false);
    });
  });

  describe('cross-team scenarios', () => {
    it('handles users with multiple team memberships correctly', () => {
      const multiTeamUser = {
        _id: 'multi-team-1',
        username: 'multi_team',
        role: 'USER',
        teams: [
          { team: 'team-1', role: 'ADMIN' },
          { team: 'team-2', role: 'MEMBER' }
        ]
      } as User;

      expect(PromptAuthorization.canCreate(multiTeamUser, 'team-1')).toBe(true);
      expect(PromptAuthorization.canCreate(multiTeamUser, 'team-2')).toBe(false);
      expect(PromptAuthorization.canView(multiTeamUser, 'team-1')).toBe(true);
      expect(PromptAuthorization.canView(multiTeamUser, 'team-2')).toBe(true);
    });
  });
});
