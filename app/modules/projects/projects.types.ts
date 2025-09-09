import type { Team } from "~/modules/teams/teams.types";

export interface Project {
  _id: string;
  name: string;
  team: Team | string;
  createdAt: string;
  isUploadingFiles: boolean;
  isConvertingFiles: boolean;
  hasSetupProject: boolean;
}