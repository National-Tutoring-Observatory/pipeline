export interface UserTeam {
  team: string;
  role: string;
  viaTeamInvite?: string;
  joinedAt?: string;
}

export interface User {
  _id: string;
  username: string;
  name?: string;
  email: string;
  role: string;
  orcidId: string;
  hasOrcidSSO: boolean;
  githubId: number;
  hasGithubSSO: boolean;
  teams: UserTeam[];
  featureFlags: string[];
  createdAt: string;
  updatedAt: string;
  inviteId: string;
  invitedAt: Date;
  isRegistered: boolean;
  registeredAt: Date;
  institution?: string;
  userRole?: string;
  useCases?: string[];
  scholarshipInterest?: boolean;
  termsAcceptedAt?: Date;
  onboardingComplete?: boolean;
}
