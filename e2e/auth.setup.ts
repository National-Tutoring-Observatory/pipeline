import { test as setup } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("http://localhost:5173");

  console.log("\n🔐 Please log in to the application in the browser...");
  console.log(
    '👉 Once logged in, press the "Resume" button in the Playwright Inspector\n',
  );

  await page.pause();

  await page.context().storageState({ path: authFile });
  console.log("✅ Authentication state saved!\n");
});
