import type { User } from '~/modules/users/users.types';
import { userIsTeamAdmin, userIsTeamMember } from '../authorization/helpers/teamMembership';

const ProjectAuthorization = {
  canCreate(user: User | null, teamId: string): boolean {
    return userIsTeamAdmin(user, teamId);
  },

  canView(user: User | null, teamId: string): boolean {
    return userIsTeamMember(user, teamId);
  },

  canUpdate(user: User | null, teamId: string): boolean {
    return userIsTeamAdmin(user, teamId);
  },

  canDelete(user: User | null, teamId: string): boolean {
    return userIsTeamAdmin(user, teamId);
  },

  Runs: {
    canManage(user: User | null, teamId: string): boolean {
      return userIsTeamMember(user, teamId);
    },
  },

  Annotations: {
    canManage(user: User | null, teamId: string): boolean {
      return userIsTeamMember(user, teamId);
    },
  },
};

type RunsAuthorizationShape = {
  [K in keyof typeof ProjectAuthorization.Runs]: boolean;
};

type AnnotationsAuthorizationShape = {
  [K in keyof typeof ProjectAuthorization.Annotations]: boolean;
};

type ProjectAuthorizationShape = {
  [K in Exclude<keyof typeof ProjectAuthorization, 'Runs' | 'Annotations'>]: boolean;
} & {
  runs: RunsAuthorizationShape;
  annotations: AnnotationsAuthorizationShape;
};

export default ProjectAuthorization;
export type { AnnotationsAuthorizationShape, ProjectAuthorizationShape, RunsAuthorizationShape };
