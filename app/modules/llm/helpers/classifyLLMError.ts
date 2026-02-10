import { APIConnectionTimeoutError, APIError, RateLimitError } from "openai";

export default function classifyLLMError(error: unknown): string {
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
