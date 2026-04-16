import { expect } from "vitest";

export default async function expectAuthRequired(fn: () => Promise<unknown>) {
  let thrown: unknown;
  try {
    await fn();
  } catch (e) {
    thrown = e;
  }
  expect(thrown).toBeInstanceOf(Response);
  expect((thrown as Response).status).toBe(302);
  expect((thrown as Response).headers.get("Location")).toBe("/signup");
}
