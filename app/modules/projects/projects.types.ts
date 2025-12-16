import type { Team } from "~/modules/teams/teams.types";
import type { User } from "~/modules/users/users.types";

export interface Project {
  _id: string;
  name: string;
  team: Team | string;
  createdAt: string;
  createdBy?: User | string;
  hasErrored: boolean;
  isUploadingFiles: boolean;
  isConvertingFiles: boolean;
  hasSetupProject: boolean;
  isDeleted?: boolean;
}
