import mongoose, { type ClientSession } from "mongoose";

export default async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>,
): Promise<T> {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(fn);
  } finally {
    await session.endSession();
  }
}
