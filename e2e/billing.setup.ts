import { test as setup } from "@playwright/test";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: "../.env" });

setup("setup billing", async () => {
  const githubId = parseInt(process.env.SUPER_ADMIN_GITHUB_ID as string);
  if (!githubId) {
    throw new Error("SUPER_ADMIN_GITHUB_ID environment variable is required.");
  }

  const {
    DOCUMENT_DB_CONNECTION_STRING,
    DOCUMENT_DB_USERNAME,
    DOCUMENT_DB_PASSWORD,
  } = process.env;
  if (
    !DOCUMENT_DB_CONNECTION_STRING ||
    !DOCUMENT_DB_USERNAME ||
    !DOCUMENT_DB_PASSWORD
  ) {
    throw new Error("Database connection environment variables are required.");
  }

  const connectionString = `mongodb://${encodeURIComponent(DOCUMENT_DB_USERNAME)}:${encodeURIComponent(DOCUMENT_DB_PASSWORD)}@${DOCUMENT_DB_CONNECTION_STRING}`;
  await mongoose.connect(connectionString, { connectTimeoutMS: 10000 });

  await mongoose.connection
    .collection("featureflags")
    .updateOne(
      { name: "HAS_BILLING" },
      { $setOnInsert: { name: "HAS_BILLING", createdAt: new Date() } },
      { upsert: true },
    );

  await mongoose.connection
    .collection("users")
    .updateOne({ githubId }, { $addToSet: { featureFlags: "HAS_BILLING" } });

  const existingPlan = await mongoose.connection
    .collection("billingplans")
    .findOne({ name: "Standard" });

  let planId: mongoose.Types.ObjectId;
  if (existingPlan) {
    planId = existingPlan._id as mongoose.Types.ObjectId;
  } else {
    const result = await mongoose.connection
      .collection("billingplans")
      .insertOne({
        name: "Standard",
        markupRate: 1.5,
        isDefault: false,
        createdAt: new Date(),
      });
    planId = result.insertedId;
  }

  const team = await mongoose.connection
    .collection("teams")
    .findOne({ name: "Research Team Alpha" });
  if (!team) {
    throw new Error("Team 'Research Team Alpha' not found.");
  }

  await mongoose.connection.collection("teambillingplans").updateOne(
    { team: team._id },
    {
      $set: {
        plan: planId,
        effectiveFrom: new Date(0),
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );

  await mongoose.disconnect();
});
