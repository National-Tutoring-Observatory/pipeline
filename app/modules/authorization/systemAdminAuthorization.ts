import type { User } from '~/modules/users/users.types';
import { userIsSuperAdmin } from './helpers/superAdmin';

const SystemAdminAuthorization = {
  FeatureFlags: {
    canManage(user: User | null): boolean {
      return userIsSuperAdmin(user);
    },
  },
  Queues: {
    canManage(user: User | null): boolean {
      return userIsSuperAdmin(user);
    },
  },
  Migrations: {
    canManage(user: User | null): boolean {
      return userIsSuperAdmin(user);
    },
  },
};

type SystemAuthorizationShape = {
  FeatureFlags: { [K in keyof typeof SystemAdminAuthorization.FeatureFlags]: boolean };
  Queues: { [K in keyof typeof SystemAdminAuthorization.Queues]: boolean };
  Migrations: { [K in keyof typeof SystemAdminAuthorization.Migrations]: boolean };
};

export default SystemAdminAuthorization;
export type { SystemAuthorizationShape };
