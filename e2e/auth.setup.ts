import { test as setup } from "@playwright/test";
import dotenv from "dotenv";
import mongoose from "mongoose";
import sessionStorage from "../sessionStorage";

dotenv.config({ path: "../.env" });

const authFile = ".auth/user.json";

async function findSuperAdminId(): Promise<string> {
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

  const user = await mongoose.connection
    .collection("users")
    .findOne({ githubId });
  await mongoose.disconnect();

  if (!user) {
    throw new Error(`No user found with githubId ${githubId}`);
  }

  return user._id.toString();
}

setup("authenticate", async ({ page }) => {
  const userId = await findSuperAdminId();

  const session = await sessionStorage.getSession();
  session.set("user", { _id: userId });

  const setCookie = await sessionStorage.commitSession(session);
  const cookieValue = setCookie.split(";")[0].split("=").slice(1).join("=");

  await page.context().addCookies([
    {
      name: "__session",
      value: cookieValue,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  await page.context().storageState({ path: authFile });
});
