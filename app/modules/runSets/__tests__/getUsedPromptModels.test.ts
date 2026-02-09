import { describe, expect, it } from "vitest";
import type { Run } from "~/modules/runs/runs.types";
import getUsedPromptModels, {
  buildUsedPromptModelKey,
  buildUsedPromptModelSet,
} from "../helpers/getUsedPromptModels";

const makeRun = (overrides: Partial<Run> = {}): Run =>
  ({
    _id: "run1",
    prompt: "prompt1",
    promptVersion: 1,
    snapshot: { model: { code: "gpt-4" } },
    ...overrides,
  }) as Run;

describe("getUsedPromptModels", () => {
  it("extracts pairs from runs with prompt, promptVersion, and snapshot.model.code", () => {
    const runs = [
      makeRun({
        _id: "r1",
        prompt: "p1",
        promptVersion: 1,
        snapshot: { model: { code: "gpt-4" } } as any,
      }),
      makeRun({
        _id: "r2",
        prompt: "p2",
        promptVersion: 2,
        snapshot: { model: { code: "gpt-3.5-turbo" } } as any,
      }),
    ];

    const pairs = getUsedPromptModels(runs);

    expect(pairs).toEqual([
      { promptId: "p1", promptVersion: 1, modelCode: "gpt-4" },
      { promptId: "p2", promptVersion: 2, modelCode: "gpt-3.5-turbo" },
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(getUsedPromptModels([])).toEqual([]);
  });
});

describe("buildUsedPromptModelKey", () => {
  it("builds correct key string", () => {
    expect(buildUsedPromptModelKey("p1", 2, "gpt-4")).toBe("p1-2-gpt-4");
  });
});

describe("buildUsedPromptModelSet", () => {
  it("builds Set from pairs", () => {
    const pairs = [
      { promptId: "p1", promptVersion: 1, modelCode: "gpt-4" },
      { promptId: "p2", promptVersion: 2, modelCode: "gpt-3.5-turbo" },
    ];

    const set = buildUsedPromptModelSet(pairs);

    expect(set.size).toBe(2);
    expect(set.has("p1-1-gpt-4")).toBe(true);
    expect(set.has("p2-2-gpt-3.5-turbo")).toBe(true);
  });

  it("deduplicates identical pairs", () => {
    const pairs = [
      { promptId: "p1", promptVersion: 1, modelCode: "gpt-4" },
      { promptId: "p1", promptVersion: 1, modelCode: "gpt-4" },
    ];

    const set = buildUsedPromptModelSet(pairs);

    expect(set.size).toBe(1);
  });
});
