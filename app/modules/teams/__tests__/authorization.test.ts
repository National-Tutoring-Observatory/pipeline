import { describe, expect, it } from 'vitest';
import type { User } from '../../users/users.types';
import TeamAuthorization from '../authorization';

describe('TeamAuthorization', () => {
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
    it('allows super admins to create teams', () => {
      expect(TeamAuthorization.canCreate(superAdminUser)).toBe(true);
    });

    it('denies regular users from creating teams', () => {
      expect(TeamAuthorization.canCreate(teamAdminUser)).toBe(false);
      expect(TeamAuthorization.canCreate(teamMemberUser)).toBe(false);
      expect(TeamAuthorization.canCreate(nonTeamUser)).toBe(false);
    });

    it('denies null users from creating teams', () => {
      expect(TeamAuthorization.canCreate(null)).toBe(false);
    });
  });

  describe('canView', () => {
    it('allows super admins to view any team', () => {
      expect(TeamAuthorization.canView(superAdminUser, 'team-1')).toBe(true);
      expect(TeamAuthorization.canView(superAdminUser, 'team-999')).toBe(true);
    });

    it('allows team members to view their team', () => {
      expect(TeamAuthorization.canView(teamAdminUser, 'team-1')).toBe(true);
      expect(TeamAuthorization.canView(teamMemberUser, 'team-1')).toBe(true);
    });

    it('denies non-members from viewing a team', () => {
      expect(TeamAuthorization.canView(nonTeamUser, 'team-1')).toBe(false);
      expect(TeamAuthorization.canView(teamAdminUser, 'team-999')).toBe(false);
    });

    it('denies null users from viewing teams', () => {
      expect(TeamAuthorization.canView(null, 'team-1')).toBe(false);
    });
  });

  describe('canUpdate', () => {
    it('allows team admins to update their team', () => {
      expect(TeamAuthorization.canUpdate(teamAdminUser, 'team-1')).toBe(true);
    });

    it('denies super admins to update any team', () => {
      expect(TeamAuthorization.canUpdate(superAdminUser, 'team-1')).toBe(false);
      expect(TeamAuthorization.canUpdate(superAdminUser, 'team-999')).toBe(false);
    });

    it('denies team members from updating team', () => {
      expect(TeamAuthorization.canUpdate(teamMemberUser, 'team-1')).toBe(false);
    });

    it('denies non-members from updating a team', () => {
      expect(TeamAuthorization.canUpdate(nonTeamUser, 'team-1')).toBe(false);
      expect(TeamAuthorization.canUpdate(teamAdminUser, 'team-999')).toBe(false);
    });

    it('denies null users from updating teams', () => {
      expect(TeamAuthorization.canUpdate(null, 'team-1')).toBe(false);
    });
  });

  describe('canDelete', () => {
    it('allows team admins to delete their team', () => {
      expect(TeamAuthorization.canDelete(teamAdminUser, 'team-1')).toBe(true);
    });

    it('denies super admins to delete any team', () => {
      expect(TeamAuthorization.canDelete(superAdminUser, 'team-1')).toBe(false);
      expect(TeamAuthorization.canDelete(superAdminUser, 'team-999')).toBe(false);
    });

    it('denies team admins from deleting other teams', () => {
      expect(TeamAuthorization.canDelete(teamAdminUser, 'team-999')).toBe(false);
    });

    it('denies team members from deleting teams', () => {
      expect(TeamAuthorization.canDelete(teamMemberUser, 'team-1')).toBe(false);
    });

    it('denies non-members from deleting teams', () => {
      expect(TeamAuthorization.canDelete(nonTeamUser, 'team-1')).toBe(false);
    });

    it('denies null users from deleting teams', () => {
      expect(TeamAuthorization.canDelete(null, 'team-1')).toBe(false);
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

      // Can admin team-1
      expect(TeamAuthorization.canUpdate(multiTeamUser, 'team-1')).toBe(true);
      // Can only view team-2 (not admin)
      expect(TeamAuthorization.canView(multiTeamUser, 'team-2')).toBe(true);
      expect(TeamAuthorization.canUpdate(multiTeamUser, 'team-2')).toBe(false);
      // Cannot access team-3
      expect(TeamAuthorization.canView(multiTeamUser, 'team-3')).toBe(false);
    });
  });

  describe('Users', () => {
    describe('canView', () => {
      it('allows super admins to view team users', () => {
        expect(TeamAuthorization.Users.canView(superAdminUser, 'team-1')).toBe(true);
      });

      it('allows team admins to view team users', () => {
        expect(TeamAuthorization.Users.canView(teamAdminUser, 'team-1')).toBe(true);
      });

      it('denies team members from viewing team users', () => {
        expect(TeamAuthorization.Users.canView(teamMemberUser, 'team-1')).toBe(false);
      });

      it('denies non-members from viewing team users', () => {
        expect(TeamAuthorization.Users.canView(nonTeamUser, 'team-1')).toBe(false);
      });

      it('denies null users from viewing team users', () => {
        expect(TeamAuthorization.Users.canView(null, 'team-1')).toBe(false);
      });
    });

    describe('canUpdate', () => {
      it('allows team admins to update team users', () => {
        expect(TeamAuthorization.Users.canUpdate(teamAdminUser, 'team-1')).toBe(true);
      });

      it('denies super admins from updating team users', () => {
        expect(TeamAuthorization.Users.canUpdate(superAdminUser, 'team-1')).toBe(false);
      });

      it('denies team members from updating team users', () => {
        expect(TeamAuthorization.Users.canUpdate(teamMemberUser, 'team-1')).toBe(false);
      });

      it('denies non-members from updating team users', () => {
        expect(TeamAuthorization.Users.canUpdate(nonTeamUser, 'team-1')).toBe(false);
      });

      it('denies null users from updating team users', () => {
        expect(TeamAuthorization.Users.canUpdate(null, 'team-1')).toBe(false);
      });
    });

    describe('canInvite', () => {
      it('allows team admins to invite users to their team', () => {
        expect(TeamAuthorization.Users.canInvite(teamAdminUser, 'team-1')).toBe(true);
      });

      it('denies super admins from inviting users to teams', () => {
        expect(TeamAuthorization.Users.canInvite(superAdminUser, 'team-1')).toBe(false);
      });

      it('denies team members from inviting users', () => {
        expect(TeamAuthorization.Users.canInvite(teamMemberUser, 'team-1')).toBe(false);
      });

      it('denies non-members from inviting users', () => {
        expect(TeamAuthorization.Users.canInvite(nonTeamUser, 'team-1')).toBe(false);
      });

      it('denies null users from inviting users', () => {
        expect(TeamAuthorization.Users.canInvite(null, 'team-1')).toBe(false);
      });
    });

    describe('canRequestAccessToTeam', () => {
      it('allows super admins not in the team to request access', () => {
        expect(TeamAuthorization.Users.canRequestAccess(superAdminUser, 'team-999')).toBe(true);
      });

      it('denies super admins already in the team from requesting access', () => {
        const superAdminInTeam: User = {
          ...superAdminUser,
          teams: [{ team: 'team-1', role: 'ADMIN' }]
        };
        expect(TeamAuthorization.Users.canRequestAccess(superAdminInTeam, 'team-1')).toBe(false);
      });

      it('denies team admins from requesting access', () => {
        expect(TeamAuthorization.Users.canRequestAccess(teamAdminUser, 'team-1')).toBe(false);
      });

      it('denies team members from requesting access', () => {
        expect(TeamAuthorization.Users.canRequestAccess(teamMemberUser, 'team-1')).toBe(false);
      });

      it('denies non members users from requesting access', () => {
        expect(TeamAuthorization.Users.canRequestAccess(nonTeamUser, 'team-1')).toBe(false);
      });

      it('denies null users from requesting access', () => {
        expect(TeamAuthorization.Users.canRequestAccess(null, 'team-1')).toBe(false);
      });
    });
  });
});
