export class InsufficientCreditsError extends Error {
  teamId: string;

  constructor(teamId: string) {
    super(
      "Your account has reached its usage limit. Please contact support to continue: https://github.com/National-Tutoring-Observatory/sandpiper/issues/new/choose",
    );
    this.name = "InsufficientCreditsError";
    this.teamId = teamId;
  }
}
