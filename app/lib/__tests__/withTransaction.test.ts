import mongoose from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../test/helpers/clearDocumentDB";
import withTransaction from "../withTransaction";

const TestModel =
  mongoose.models.TransactionTest ||
  mongoose.model(
    "TransactionTest",
    new mongoose.Schema({ value: Number }),
    "transaction_tests",
  );

describe("withTransaction", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("commits writes when the callback succeeds", async () => {
    await withTransaction(async (session) => {
      await TestModel.create([{ value: 1 }], { session });
      await TestModel.create([{ value: 2 }], { session });
    });

    const docs = await TestModel.find();
    expect(docs).toHaveLength(2);
  });

  it("rolls back all writes when the callback throws", async () => {
    await expect(
      withTransaction(async (session) => {
        await TestModel.create([{ value: 1 }], { session });
        throw new Error("simulated failure");
      }),
    ).rejects.toThrow("simulated failure");

    const docs = await TestModel.find();
    expect(docs).toHaveLength(0);
  });

  it("returns the value from the callback", async () => {
    const result = await withTransaction(async (session) => {
      const [doc] = await TestModel.create([{ value: 42 }], { session });
      return doc.value;
    });

    expect(result).toBe(42);
  });
});
