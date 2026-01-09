import { userIsSuperAdmin } from '~/modules/authorization/helpers/superAdmin';
import type { User } from './users.types';

const UserManagementAuthorization = {
  canView: (user: User | null): boolean => {
    return userIsSuperAdmin(user);
  },

  canAssignSuperAdminToUser: ({ target, performer }: { target: User; performer: User }): boolean => {
    return (
      userIsSuperAdmin(performer) &&
      !userIsSuperAdmin(target) &&
      target._id !== performer._id
    );
  },

  canRevokeSuperAdminFromUser: ({ target, performer }: { target: User; performer: User }): boolean => {
    return (
      userIsSuperAdmin(performer) &&
      userIsSuperAdmin(target) &&
      target._id !== performer._id
    );
  },
};

export default UserManagementAuthorization;
