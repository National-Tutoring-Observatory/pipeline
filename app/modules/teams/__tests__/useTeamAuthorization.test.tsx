/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../../users/users.types';

// Mock only the context to control the user in tests
vi.mock('../../authentication/containers/authentication.container', () => {
  const mockAuthContext = React.createContext<User | null>(null);
  return {
    AuthenticationContext: mockAuthContext,
  };
});

import { AuthenticationContext } from '../../authentication/containers/authentication.container';
import useTeamAuthorization from '../hooks/useTeamAuthorization';

const createWrapper = (user: User | null) => {
  return ({ children }: any) => {
    return React.createElement(
      AuthenticationContext.Provider,
      { value: user },
      children
    );
  };
};

describe('useTeamAuthorization', () => {
  let mockUser: User;
  let userWrapper: ReturnType<typeof createWrapper>;
  let superAdminWrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    mockUser = {
      _id: 'user-1',
      username: 'test',
      teams: ([] as any),
    } as User;
    userWrapper = createWrapper(mockUser);

    const superAdminUser = {
      _id: 'admin-1',
      username: 'admin',
      role: 'SUPER_ADMIN',
      teams: ([] as any),
    } as User;
    superAdminWrapper = createWrapper(superAdminUser);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('hook behavior', () => {
    it('returns defaults when called with null teamId', () => {
      const { result } = renderHook(() => useTeamAuthorization(null), {
        wrapper: userWrapper,
      });
      expect(result.current.canView).toBe(false);
      expect(result.current.canUpdate).toBe(false);
      expect(result.current.canDelete).toBe(false);
      expect(result.current.users.canView).toBe(false);
      expect(result.current.users.canUpdate).toBe(false);
      expect(result.current.users.canInvite).toBe(false);
      expect(result.current.users.canRequestAccess).toBe(false);
      expect(result.current.canCreate).toBe(false);
    });

    it('returns canCreate true when user is super admin and teamId is null', () => {
      const { result } = renderHook(() => useTeamAuthorization(null), {
        wrapper: superAdminWrapper,
      });
      expect(result.current.canCreate).toBe(true);
    });

    it('delegates to TeamAuthorization when teamId is provided', () => {
      const { result } = renderHook(() => useTeamAuthorization('team-1'), {
        wrapper: userWrapper,
      });
      expect(result.current.canCreate).toBe(false);
      expect(result.current.canView).toBe(false);
      expect(result.current.canUpdate).toBe(false);
      expect(result.current.canDelete).toBe(false);
      expect(result.current.users.canView).toBe(false);
      expect(result.current.users.canUpdate).toBe(false);
      expect(result.current.users.canInvite).toBe(false);
    });
  });
});
