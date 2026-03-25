export class InsufficientCreditsError extends Error {
  teamId: string;

  constructor(teamId: string) {
    super(
      "Insufficient credits. Please add credits to continue using LLM features.",
    );
    this.name = "InsufficientCreditsError";
    this.teamId = teamId;
  }
}
