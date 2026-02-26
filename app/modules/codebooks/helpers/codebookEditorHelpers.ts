import type {
  CodebookCategory,
  CodebookCode,
  CodebookExample,
} from "../codebooks.types";

export const EXAMPLE_TYPES = ["NEAR_MISS", "NEAR_HIT", "HIT", "MISS"] as const;

export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export function createEmptyExample(): CodebookExample {
  return { _id: generateId(), example: "", exampleType: "HIT" };
}

export function createEmptyCode(): CodebookCode {
  return { _id: generateId(), code: "", definition: "", examples: [] };
}

export function createEmptyCategory(): CodebookCategory {
  return {
    _id: generateId(),
    name: "New category",
    description: "",
    codes: [],
  };
}
