import { describe, expect, it } from 'vitest';
import type { User } from '~/modules/users/users.types';
import ProjectAuthorization from '../authorization';

describe('ProjectAuthorization', () => {
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
    it('allows team admins to create projects in their team', () => {
      expect(ProjectAuthorization.canCreate(teamAdminUser, 'team-1')).toBe(true);
    });

    it('denies super admins to create projects in a team', () => {
      expect(ProjectAuthorization.canCreate(superAdminUser, 'team-1')).toBe(false);
    });

    it('denies team members from creating projects', () => {
      expect(ProjectAuthorization.canCreate(teamMemberUser, 'team-1')).toBe(false);
    });

    it('denies non-members from creating projects', () => {
      expect(ProjectAuthorization.canCreate(nonTeamUser, 'team-1')).toBe(false);
      expect(ProjectAuthorization.canCreate(teamAdminUser, 'team-999')).toBe(false);
    });

    it('denies null users from creating projects', () => {
      expect(ProjectAuthorization.canCreate(null, 'team-1')).toBe(false);
    });
  });

  describe('canView', () => {
    it('allows team members to view projects in their team', () => {
      expect(ProjectAuthorization.canView(teamAdminUser, 'team-1')).toBe(true);
      expect(ProjectAuthorization.canView(teamMemberUser, 'team-1')).toBe(true);
    });

    it('denies super admins to view projects in a team', () => {
      expect(ProjectAuthorization.canView(superAdminUser, 'team-1')).toBe(false);
    });

    it('denies non-members from viewing projects', () => {
      expect(ProjectAuthorization.canView(nonTeamUser, 'team-1')).toBe(false);
      expect(ProjectAuthorization.canView(teamAdminUser, 'team-999')).toBe(false);
    });

    it('denies null users from viewing projects', () => {
      expect(ProjectAuthorization.canView(null, 'team-1')).toBe(false);
    });
  });

  describe('canUpdate', () => {
    it('allows team members to update projects in their team', () => {
      expect(ProjectAuthorization.canUpdate(teamAdminUser, 'team-1')).toBe(true);
    });

    it('denies super admins to update projects in a team', () => {
      expect(ProjectAuthorization.canUpdate(superAdminUser, 'team-1')).toBe(false);
    });

    it('denies team members from updating projects', () => {
      expect(ProjectAuthorization.canUpdate(teamMemberUser, 'team-1')).toBe(false);
    });

    it('denies non-members from updating projects', () => {
      expect(ProjectAuthorization.canUpdate(nonTeamUser, 'team-1')).toBe(false);
      expect(ProjectAuthorization.canUpdate(teamAdminUser, 'team-999')).toBe(false);
    });

    it('denies null users from updating projects', () => {
      expect(ProjectAuthorization.canUpdate(null, 'team-1')).toBe(false);
    });
  });

  describe('canDelete', () => {
    it('allows team members to delete projects in their team', () => {
      expect(ProjectAuthorization.canDelete(teamAdminUser, 'team-1')).toBe(true);
    });

    it('denies super admins to delete projects in a team', () => {
      expect(ProjectAuthorization.canDelete(superAdminUser, 'team-1')).toBe(false);
    });

    it('denies non-members from deleting projects', () => {
      expect(ProjectAuthorization.canDelete(nonTeamUser, 'team-1')).toBe(false);
      expect(ProjectAuthorization.canDelete(teamAdminUser, 'team-999')).toBe(false);
    });

    it('denies null users from deleting projects', () => {
      expect(ProjectAuthorization.canDelete(null, 'team-1')).toBe(false);
    });
  });

  describe('canManageRuns', () => {
    it('allows team members to manage runs in their team', () => {
      expect(ProjectAuthorization.canManageRuns(teamAdminUser, 'team-1')).toBe(true);
      expect(ProjectAuthorization.canManageRuns(teamMemberUser, 'team-1')).toBe(true);
    });

    it('denies super admins to manage runs in a team', () => {
      expect(ProjectAuthorization.canManageRuns(superAdminUser, 'team-1')).toBe(false);
    });

    it('denies non-members from managing runs', () => {
      expect(ProjectAuthorization.canManageRuns(nonTeamUser, 'team-1')).toBe(false);
      expect(ProjectAuthorization.canManageRuns(teamAdminUser, 'team-999')).toBe(false);
    });

    it('denies null users from managing runs', () => {
      expect(ProjectAuthorization.canManageRuns(null, 'team-1')).toBe(false);
    });
  });

  describe('canManageAnnotations', () => {
    it('allows team members to manage annotations in their team', () => {
      expect(ProjectAuthorization.canManageAnnotations(teamAdminUser, 'team-1')).toBe(true);
      expect(ProjectAuthorization.canManageAnnotations(teamMemberUser, 'team-1')).toBe(true);
    });

    it('denies super admins to manage annotations in a team', () => {
      expect(ProjectAuthorization.canManageAnnotations(superAdminUser, 'team-1')).toBe(false);
    });

    it('denies non-members from managing annotations', () => {
      expect(ProjectAuthorization.canManageAnnotations(nonTeamUser, 'team-1')).toBe(false);
      expect(ProjectAuthorization.canManageAnnotations(teamAdminUser, 'team-999')).toBe(false);
    });

    it('denies null users from managing annotations', () => {
      expect(ProjectAuthorization.canManageAnnotations(null, 'team-1')).toBe(false);
    });
  });

  describe('cross-team scenarios', () => {
    it('handles users with multiple team memberships correctly', () => {
      const multiTeamUser: User = {
        ...teamAdminUser,
        teams: [
          { team: 'team-1', role: 'ADMIN' },
          { team: 'team-2', role: 'MEMBER' },
        ],
      };

      // Can manage projects in team-1
      expect(ProjectAuthorization.canCreate(multiTeamUser, 'team-1')).toBe(true);
      expect(ProjectAuthorization.canUpdate(multiTeamUser, 'team-1')).toBe(true);
      // Can't manage projects in team-2
      expect(ProjectAuthorization.canCreate(multiTeamUser, 'team-2')).toBe(false);
      expect(ProjectAuthorization.canUpdate(multiTeamUser, 'team-2')).toBe(false);
      // Cannot manage projects in team-3
      expect(ProjectAuthorization.canCreate(multiTeamUser, 'team-3')).toBe(false);
    });
  });
});
