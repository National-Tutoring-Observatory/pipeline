import { APIConnectionTimeoutError, APIError, RateLimitError } from "openai";
import { InsufficientCreditsError } from "~/modules/billing/errors/insufficientCreditsError";
import { NotificationService } from "~/modules/notifications/notification";

export default function handleLLMError(error: unknown): string {
  if (error instanceof InsufficientCreditsError) {
    NotificationService.notifyCreditsExhausted(error.teamId).catch(
      console.warn,
    );
    return error.message;
  }
  if (error instanceof RateLimitError) {
    return "Rate limit exceeded. Too many requests to the LLM provider.";
  }
  if (error instanceof APIConnectionTimeoutError) {
    return "Request timed out. The LLM provider did not respond in time.";
  }
  if (error instanceof APIError) {
    return `LLM API error (${error.status}): ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
