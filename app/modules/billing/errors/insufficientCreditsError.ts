export class InsufficientCreditsError extends Error {
  teamId: string;

  constructor(teamId: string) {
    super(
      "Your account has reached its usage limit. Please contact support to continue: https://forms.gle/e23QwDvQAVZyKD9g8",
    );
    this.name = "InsufficientCreditsError";
    this.teamId = teamId;
  }
}
