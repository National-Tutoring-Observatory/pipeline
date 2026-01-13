import { describe, it, expect } from 'vitest';
import UserManagementAuthorization from '../authorization';
import type { User } from '../users.types';

const mockUser = (overrides?: Partial<User>): User => ({
  _id: 'user-1',
  username: 'testuser',
  role: 'user',
  orcidId: '',
  hasOrcidSSO: false,
  githubId: 0,
  hasGithubSSO: false,
  teams: [],
  featureFlags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  inviteId: '',
  invitedAt: new Date(),
  isRegistered: true,
  registeredAt: new Date(),
  ...overrides,
});

describe('UserManagementAuthorization', () => {
  describe('canAssignSuperAdminToUser', () => {
    it('returns false if performer is not a super admin', () => {
      const result = UserManagementAuthorization.canAssignSuperAdminToUser({
        target: mockUser({ _id: 'user-2', role: 'user' }),
        performer: mockUser({ _id: 'user-1', role: 'user' }),
      });

      expect(result).toBe(false);
    });

    it('returns false if target and performer are the same user', () => {
      const sameUser = mockUser({ _id: 'user-1', role: 'SUPER_ADMIN' });

      const result = UserManagementAuthorization.canAssignSuperAdminToUser({
        target: sameUser,
        performer: sameUser,
      });

      expect(result).toBe(false);
    });

    it('returns false if target is already a super admin', () => {
      const result = UserManagementAuthorization.canAssignSuperAdminToUser({
        target: mockUser({ _id: 'user-2', role: 'SUPER_ADMIN' }),
        performer: mockUser({ _id: 'user-1', role: 'SUPER_ADMIN' }),
      });

      expect(result).toBe(false);
    });

    it('returns true if performer is super admin, users are different, and target is not super admin', () => {
      const result = UserManagementAuthorization.canAssignSuperAdminToUser({
        target: mockUser({ _id: 'user-2', role: 'user' }),
        performer: mockUser({ _id: 'user-1', role: 'SUPER_ADMIN' }),
      });

      expect(result).toBe(true);
    });
  });

  describe('canRevokeSuperAdminFromUser', () => {
    it('returns false if performer is not a super admin', () => {
      const result = UserManagementAuthorization.canRevokeSuperAdminFromUser({
        target: mockUser({ _id: 'user-2', role: 'SUPER_ADMIN' }),
        performer: mockUser({ _id: 'user-1', role: 'user' }),
      });

      expect(result).toBe(false);
    });

    it('returns false if target and performer are the same user', () => {
      const sameUser = mockUser({ _id: 'user-1', role: 'SUPER_ADMIN' });

      const result = UserManagementAuthorization.canRevokeSuperAdminFromUser({
        target: sameUser,
        performer: sameUser,
      });

      expect(result).toBe(false);
    });

    it('returns false if target is not a super admin', () => {
      const result = UserManagementAuthorization.canRevokeSuperAdminFromUser({
        target: mockUser({ _id: 'user-2', role: 'user' }),
        performer: mockUser({ _id: 'user-1', role: 'SUPER_ADMIN' }),
      });

      expect(result).toBe(false);
    });

    it('returns true if performer is super admin, users are different, and target is super admin', () => {
      const result = UserManagementAuthorization.canRevokeSuperAdminFromUser({
        target: mockUser({ _id: 'user-2', role: 'SUPER_ADMIN' }),
        performer: mockUser({ _id: 'user-1', role: 'SUPER_ADMIN' }),
      });

      expect(result).toBe(true);
    });
  });
});
