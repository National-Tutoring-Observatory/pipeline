import { expect, test } from "@playwright/test";

test.describe("Collections", () => {
  test("should create a new collection", async ({ page }) => {
    const timestamp = Date.now();
    const collectionName = `E2E Test Collection ${timestamp}`;

    await page.goto("/");

    const projectLink = page
      .getByRole("link")
      .filter({ hasText: "Tutoring Transcripts Study 2024" });
    await projectLink.click();

    const collectionsCard = page
      .getByRole("link")
      .filter({ hasText: "Collections" });
    await collectionsCard.click();

    await page
      .getByRole("button", { name: "Create collection" })
      .first()
      .click();

    await expect(page).toHaveURL(/\/projects\/[a-f0-9]+\/create-collection$/);
    await expect(
      page.getByRole("heading", { name: "Create Collection" }),
    ).toBeVisible();

    await page
      .getByRole("textbox", { name: "Collection Name" })
      .fill(collectionName);

    await page
      .getByRole("combobox")
      .filter({ hasText: "Select prompt..." })
      .click();
    await page.getByRole("option").first().click();
    await page.getByRole("button", { name: "Add Prompt" }).click();

    await page
      .getByRole("combobox")
      .filter({ hasText: "Select model..." })
      .click();
    await page.getByRole("option").first().click();
    await page.getByRole("button", { name: "Add Model" }).click();

    await page
      .getByRole("row")
      .filter({ hasText: "session_001.json" })
      .getByRole("checkbox")
      .check();

    await page
      .getByRole("button", { name: "Create Collection & Launch Runs" })
      .click();

    await expect(page).toHaveURL(
      /\/projects\/[a-f0-9]+\/collections\/[a-f0-9]+$/,
    );
    await expect(page.getByText(collectionName).first()).toBeVisible();

    await page.getByRole("link", { name: "Collections", exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/[a-f0-9]+\/collections$/);

    await expect(
      page
        .locator('[href*="/collections/"]')
        .filter({ hasText: collectionName })
        .first(),
    ).toBeVisible();
  });

  test("should display collections list for a project", async ({ page }) => {
    await page.goto("/");

    const projectLink = page
      .getByRole("link")
      .filter({ hasText: "Tutoring Transcripts Study 2024" });
    await projectLink.click();

    const collectionsCard = page
      .getByRole("link")
      .filter({ hasText: "Collections" });
    await collectionsCard.click();

    await expect(page).toHaveURL(/\/projects\/[a-f0-9]+\/collections$/);
    await expect(
      page.getByRole("button", { name: "Create collection" }),
    ).toBeVisible();
  });

  test("should navigate to collection detail page", async ({ page }) => {
    await page.goto("/");

    const projectLink = page
      .getByRole("link")
      .filter({ hasText: "Tutoring Transcripts Study 2024" });
    await projectLink.click();

    const collectionsCard = page
      .getByRole("link")
      .filter({ hasText: "Collections" });
    await collectionsCard.click();

    const collectionLink = page
      .locator('[href*="/collections/"]')
      .filter({ hasText: "E2E Test Collection" })
      .first();
    await collectionLink.click();

    await expect(page).toHaveURL(
      /\/projects\/[a-f0-9]+\/collections\/[a-f0-9]+$/,
    );
    await expect(page.getByText("Created").first()).toBeVisible();
    await expect(page.getByText("Sessions").first()).toBeVisible();
    await expect(page.getByText("Runs").first()).toBeVisible();
  });

  test("should display collection sessions and runs", async ({ page }) => {
    await page.goto("/");

    const projectLink = page
      .getByRole("link")
      .filter({ hasText: "Tutoring Transcripts Study 2024" });
    await projectLink.click();

    const collectionsCard = page
      .getByRole("link")
      .filter({ hasText: "Collections" });
    await collectionsCard.click();

    const collectionLink = page
      .locator('[href*="/collections/"]')
      .filter({ hasText: "E2E Test Collection" })
      .first();
    await collectionLink.click();

    await expect(page.getByText("session_001.json")).toBeVisible();
    await expect(page.getByText("Praise classification").first()).toBeVisible();
  });

  test("should navigate back using breadcrumbs", async ({ page }) => {
    await page.goto("/");

    const projectLink = page
      .getByRole("link")
      .filter({ hasText: "Tutoring Transcripts Study 2024" });
    await projectLink.click();

    const collectionsCard = page
      .getByRole("link")
      .filter({ hasText: "Collections" });
    await collectionsCard.click();

    const collectionLink = page
      .locator('[href*="/collections/"]')
      .filter({ hasText: "E2E Test Collection" })
      .first();
    await collectionLink.click();

    await page.getByRole("link", { name: "Collections", exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/[a-f0-9]+\/collections$/);
  });

  test("should show CSV download option", async ({ page }) => {
    await page.goto("/");

    const projectLink = page
      .getByRole("link")
      .filter({ hasText: "Tutoring Transcripts Study 2024" });
    await projectLink.click();

    const collectionsCard = page
      .getByRole("link")
      .filter({ hasText: "Collections" });
    await collectionsCard.click();

    const collectionLink = page
      .locator('[href*="/collections/"]')
      .filter({ hasText: "E2E Test Collection" })
      .first();
    await collectionLink.click();

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

    const collectionsCard = page
      .getByRole("link")
      .filter({ hasText: "Collections" });
    await collectionsCard.click();

    const collectionLink = page
      .locator('[href*="/collections/"]')
      .filter({ hasText: "E2E Test Collection" })
      .first();
    await collectionLink.click();

    await page.getByRole("button", { name: "Export" }).click();
    await page.getByRole("menuitem", { name: /JSONL.*jsonl file/ }).click();

    const jsonlDownloadLink = page.locator('a[href*="exportType=JSONL"]');
    await expect(jsonlDownloadLink).toBeVisible({ timeout: 15000 });
    await expect(jsonlDownloadLink).toHaveAttribute("href", /exportType=JSONL/);
  });
});
