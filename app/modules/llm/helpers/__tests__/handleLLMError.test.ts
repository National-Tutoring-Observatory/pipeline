import { APIConnectionTimeoutError, APIError, RateLimitError } from "openai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InsufficientCreditsError } from "~/modules/billing/errors/insufficientCreditsError";
import handleLLMError from "../handleLLMError";

vi.mock("~/modules/notifications/notification", () => ({
  NotificationService: {
    notifyCreditsExhausted: vi.fn().mockResolvedValue(undefined),
  },
}));

import { NotificationService } from "~/modules/notifications/notification";

describe("handleLLMError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("notifies and returns message for InsufficientCreditsError", () => {
    const error = new InsufficientCreditsError("team-123");

    const result = handleLLMError(error);

    expect(result).toBe(error.message);
    expect(NotificationService.notifyCreditsExhausted).toHaveBeenCalledWith(
      "team-123",
    );
  });

  it("returns rate limit message", () => {
    const error = new RateLimitError(
      429,
      { message: "rate limited", type: "rate_limit" },
      "rate limited",
      new Headers(),
    );

    expect(handleLLMError(error)).toBe(
      "Rate limit exceeded. Too many requests to the LLM provider.",
    );
    expect(NotificationService.notifyCreditsExhausted).not.toHaveBeenCalled();
  });

  it("returns timeout message", () => {
    const error = new APIConnectionTimeoutError({ message: "timed out" });

    expect(handleLLMError(error)).toBe(
      "Request timed out. The LLM provider did not respond in time.",
    );
  });

  it("returns API error with status", () => {
    const error = new APIError(
      500,
      { message: "server error", type: "server_error" },
      "server error",
      new Headers(),
    );

    expect(handleLLMError(error)).toBe("LLM API error (500): 500 server error");
  });

  it("returns message for generic Error", () => {
    const error = new Error("something broke");

    expect(handleLLMError(error)).toBe("something broke");
  });

  it("returns string representation for non-Error values", () => {
    expect(handleLLMError("raw string")).toBe("raw string");
    expect(handleLLMError(42)).toBe("42");
    expect(handleLLMError(null)).toBe("null");
  });
});
