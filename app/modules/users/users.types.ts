export interface UserTeam {
  team: string;
  role: string;
}

export interface User {
  _id: string;
  username: string;
  role: string;
  orcidId: string;
  githubId: number;
  teams: UserTeam[]
  createdAt: string;
  updatedAt: string;
}