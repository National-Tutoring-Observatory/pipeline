import { describe, expect, it } from 'vitest';
import type { User } from '~/modules/users/users.types';
import PromptAuthorization from '../authorization';
import type { Prompt } from '../prompts.types';

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

  const multiTeamUser = {
    _id: 'multi-team-1',
    username: 'multi_team',
    role: 'USER',
    teams: [
      { team: 'team-1', role: 'MEMBER' },
      { team: 'team-2', role: 'ADMIN' }
    ]
  } as User;

  // Shared test fixtures
  const promptInTeam1: Prompt = {
    _id: 'prompt-1',
    name: 'Test Prompt',
    team: 'team-1',
    createdAt: '2024-01-01',
    annotationType: 'PER_UTTERANCE',
    productionVersion: 1,
    createdBy: 'team-admin-1',
  };

  const promptInTeam2: Prompt = {
    ...promptInTeam1,
    _id: 'prompt-2',
    team: 'team-2',
  };

  const promptCreatedByTeamMember: Prompt = {
    ...promptInTeam1,
    _id: 'prompt-3',
    createdBy: 'team-member-1',
  };

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
      expect(PromptAuthorization.canView(teamMemberUser, promptInTeam1)).toBe(true);
    });

    it('allows team admins to view prompts in their team', () => {
      expect(PromptAuthorization.canView(teamAdminUser, promptInTeam1)).toBe(true);
    });

    it('denies super admins to view prompts in a team', () => {
      expect(PromptAuthorization.canView(superAdminUser, promptInTeam1)).toBe(false);
    });

    it('denies non-members from viewing prompts in another team', () => {
      expect(PromptAuthorization.canView(nonTeamUser, promptInTeam1)).toBe(false);
    });

    it('denies null users from viewing prompts in a team', () => {
      expect(PromptAuthorization.canView(null, promptInTeam1)).toBe(false);
    });
  });

  describe('canUpdate', () => {
    it('allows team admins to update their own prompts', () => {
      expect(PromptAuthorization.canUpdate(teamAdminUser, promptInTeam1)).toBe(true);
    });

    it('allows team members to update their own prompts', () => {
      expect(PromptAuthorization.canUpdate(teamMemberUser, promptCreatedByTeamMember)).toBe(true);
    });

    it('allows team admins to update any prompt in their team', () => {
      expect(PromptAuthorization.canUpdate(teamAdminUser, promptCreatedByTeamMember)).toBe(true);
    });

    it('denies team members from updating other members prompts', () => {
      expect(PromptAuthorization.canUpdate(teamMemberUser, promptInTeam1)).toBe(false);
    });

    it('denies team members from updating prompts from other teams', () => {
      expect(PromptAuthorization.canUpdate(teamMemberUser, promptInTeam2)).toBe(false);
    });

    it('denies super admins to update prompts in a team', () => {
      expect(PromptAuthorization.canUpdate(superAdminUser, promptInTeam1)).toBe(false);
    });

    it('denies non-members from updating prompts', () => {
      expect(PromptAuthorization.canUpdate(nonTeamUser, promptInTeam1)).toBe(false);
    });

    it('denies null users from updating prompts', () => {
      expect(PromptAuthorization.canUpdate(null, promptInTeam1)).toBe(false);
    });
  });

  describe('canDelete', () => {
    it('allows team admins to delete their own prompts', () => {
      expect(PromptAuthorization.canDelete(teamAdminUser, promptInTeam1)).toBe(true);
    });

    it('allows team members to delete their own prompts', () => {
      expect(PromptAuthorization.canDelete(teamMemberUser, promptCreatedByTeamMember)).toBe(true);
    });

    it('allows team admins to delete any prompt in their team', () => {
      expect(PromptAuthorization.canDelete(teamAdminUser, promptCreatedByTeamMember)).toBe(true);
    });

    it('denies team members from deleting other users\' prompts', () => {
      expect(PromptAuthorization.canDelete(teamMemberUser, promptInTeam1)).toBe(false);
    });

    it('denies team members from deleting prompts from other teams', () => {
      expect(PromptAuthorization.canDelete(teamMemberUser, promptInTeam2)).toBe(false);
    });

    it('denies super admins to delete prompts in a team', () => {
      expect(PromptAuthorization.canDelete(superAdminUser, promptInTeam1)).toBe(false);
    });

    it('denies non-members from deleting prompts', () => {
      expect(PromptAuthorization.canDelete(nonTeamUser, promptInTeam1)).toBe(false);
    });

    it('denies null users from deleting prompts', () => {
      expect(PromptAuthorization.canDelete(null, promptInTeam1)).toBe(false);
    });
  });

  describe('multiple team memberships', () => {
    it('allows users to manage prompts in all their teams', () => {
      const multiTeamPrompt1: Prompt = {
        ...promptInTeam1,
        _id: 'prompt-mt-1',
        team: 'team-1',
        createdBy: 'multi-team-1',
      };

      const multiTeamPrompt2: Prompt = {
        ...promptInTeam1,
        _id: 'prompt-mt-2',
        team: 'team-2',
        createdBy: 'multi-team-1',
      };

      expect(PromptAuthorization.canDelete(multiTeamUser, multiTeamPrompt1)).toBe(true);
      expect(PromptAuthorization.canDelete(multiTeamUser, multiTeamPrompt2)).toBe(true);
    });
  });
});
