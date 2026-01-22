import { expect, test } from "@playwright/test";

test.describe("Runs", () => {
  test("should create a new run", async ({ page }) => {
    const timestamp = Date.now();
    const runName = `E2E Test Run ${timestamp}`;

    await page.goto("/");

    const projectLink = page
      .getByRole("link")
      .filter({ hasText: "Tutoring Transcripts Study 2024" });
    await projectLink.click();

    await page.getByRole("button", { name: "Create run" }).first().click();

    await expect(page).toHaveURL(/\/projects\/[a-f0-9]+\/create-run$/);

    await page.getByRole("textbox", { name: "Name" }).fill(runName);

    await page
      .getByRole("combobox")
      .filter({ hasText: "Select prompt..." })
      .click();
    await page.getByRole("option").first().click();

    await page
      .getByRole("combobox")
      .filter({ hasText: "Gemini 2.5 Flash" })
      .click();
    await page.getByRole("option").first().click();

    await page
      .getByRole("row")
      .filter({ hasText: "session_001.json" })
      .getByRole("checkbox")
      .check();

    await page.getByRole("button", { name: "Start run" }).click();

    await expect(page).toHaveURL(/\/projects\/[a-f0-9]+\/runs\/[a-f0-9]+$/);
    await expect(page.getByText(runName).first()).toBeVisible();
  });

  test("should display runs list for a project", async ({ page }) => {
    await page.goto("/");

    const projectLink = page
      .getByRole("link")
      .filter({ hasText: "Tutoring Transcripts Study 2024" });
    await projectLink.click();

    await expect(
      page.getByRole("button", { name: "Create run" }),
    ).toBeVisible();
    await expect(page.getByText("E2E Test Run").first()).toBeVisible();
  });

  test("should navigate to run detail page", async ({ page }) => {
    await page.goto("/");

    const projectLink = page
      .getByRole("link")
      .filter({ hasText: "Tutoring Transcripts Study 2024" });
    await projectLink.click();

    const runLink = page
      .getByRole("link")
      .filter({ hasText: "E2E Test Run" })
      .first();
    await runLink.click();

    await expect(page).toHaveURL(/\/projects\/[a-f0-9]+\/runs\/[a-f0-9]+$/);
    await expect(page.getByText("Annotation type")).toBeVisible();
    await expect(page.getByText("Per utterance")).toBeVisible();
    await expect(page.getByText("Selected prompt")).toBeVisible();
    await expect(page.getByText("Selected model")).toBeVisible();
  });

  test("should show run edit button", async ({ page }) => {
    await page.goto("/");

    const projectLink = page
      .getByRole("link")
      .filter({ hasText: "Tutoring Transcripts Study 2024" });
    await projectLink.click();

    const runLink = page
      .getByRole("link")
      .filter({ hasText: "E2E Test Run" })
      .first();
    await runLink.click();

    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
  });

  test("should display sessions table", async ({ page }) => {
    await page.goto("/");

    const projectLink = page
      .getByRole("link")
      .filter({ hasText: "Tutoring Transcripts Study 2024" });
    await projectLink.click();

    const runLink = page
      .getByRole("link")
      .filter({ hasText: "E2E Test Run" })
      .first();
    await runLink.click();

    await expect(
      page.getByRole("columnheader", { name: "Name" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Started" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Finished" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Status" }),
    ).toBeVisible();
    await expect(page.getByText("session_001.json")).toBeVisible();
  });

  test("should show CSV download option", async ({ page }) => {
    await page.goto("/");

    const projectLink = page
      .getByRole("link")
      .filter({ hasText: "Tutoring Transcripts Study 2024" });
    await projectLink.click();

    const runLink = page
      .getByRole("link")
      .filter({ hasText: "E2E Test Run" })
      .first();
    await runLink.click();

    await page.getByRole("button", { name: "Export" }).click();
    await page.getByRole("menuitem", { name: /As Table.*csv file/ }).click();

    const csvDownloadLink = page.locator('a[href*="exportType=CSV"]');
    await expect(csvDownloadLink).toBeVisible({ timeout: 15000 });
    await expect(csvDownloadLink).toHaveAttribute("href", /exportType=CSV/);
  });

  test("should show JSONL download option", async ({ page }) => {
    await page.goto("/");

    const projectLink = page
      .getByRole("link")
      .filter({ hasText: "Tutoring Transcripts Study 2024" });
    await projectLink.click();

    const runLink = page
      .getByRole("link")
      .filter({ hasText: "E2E Test Run" })
      .first();
    await runLink.click();

    await page.getByRole("button", { name: "Export" }).click();
    await page.getByRole("menuitem", { name: /JSONL.*jsonl file/ }).click();

    const jsonlDownloadLink = page.locator('a[href*="exportType=JSONL"]');
    await expect(jsonlDownloadLink).toBeVisible({ timeout: 15000 });
    await expect(jsonlDownloadLink).toHaveAttribute("href", /exportType=JSONL/);
  });
});
