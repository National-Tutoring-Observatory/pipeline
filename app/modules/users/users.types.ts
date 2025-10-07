export interface UserTeam {
  team: string;
  role: string;
}

export interface User {
  _id: string;
  username: string;
  role: string;
  orcidId: string;
  hasOrcidSSO: boolean;
  githubId: number;
  hasGithubSSO: boolean;
  teams: UserTeam[]
  createdAt: string;
  updatedAt: string;
  inviteId: string;
  invitedAt: Date
}