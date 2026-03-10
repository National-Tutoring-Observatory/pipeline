import { expect, test } from "@playwright/test";

test.describe("Prompts", () => {
  test("should display prompts list", async ({ page }) => {
    await page.goto("/prompts");

    await expect(
      page.getByRole("button", { name: "Create prompt" }),
    ).toBeVisible();
    await expect(page.getByText("Praise classification")).toBeVisible();
    await expect(page.getByText("Student Engagement Analysis")).toBeVisible();
    await expect(
      page.getByText("Teacher Feedback Classification"),
    ).toBeVisible();
  });

  test("should show annotation types in list", async ({ page }) => {
    await page.goto("/prompts");

    const perUtterancePrompts = page
      .getByText("Annotation type - Per utterance")
      .first();
    await expect(perUtterancePrompts).toBeVisible();

    const perSessionPrompts = page
      .getByText("Annotation type - Per session")
      .first();
    await expect(perSessionPrompts).toBeVisible();
  });

  test("should navigate to prompt detail page", async ({ page }) => {
    await page.goto("/prompts");

    const promptLink = page
      .getByRole("link")
      .filter({ hasText: "Praise classification" });
    await promptLink.click();

    await expect(page).toHaveURL(/\/prompts\/[a-f0-9]+\/\d+$/);
    await expect(
      page.getByText("Annotation Type: Per utterance"),
    ).toBeVisible();
  });

  test("should show prompt edit button", async ({ page }) => {
    await page.goto("/prompts");

    const promptLink = page
      .getByRole("link")
      .filter({ hasText: "Praise classification" });
    await promptLink.click();

    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
  });

  test("should display prompt versions", async ({ page }) => {
    await page.goto("/prompts");

    const promptLink = page
      .getByRole("link")
      .filter({ hasText: "Praise classification" });
    await promptLink.click();

    await expect(page.getByText("Versions")).toBeVisible();
    await expect(page.getByText("# 1")).toBeVisible();
    await expect(page.getByText("Production")).toBeVisible();
  });

  test("should display prompt content", async ({ page }) => {
    await page.goto("/prompts");

    const promptLink = page
      .getByRole("link")
      .filter({ hasText: "Praise classification" });
    await promptLink.click();

    await expect(page.getByText("Name", { exact: true })).toBeVisible();
    await expect(page.getByText("Prompt", { exact: true })).toBeVisible();
    await expect(page.getByText("Annotation schema")).toBeVisible();
  });

  test("should show annotation schema fields", async ({ page }) => {
    await page.goto("/prompts");

    const promptLink = page
      .getByRole("link")
      .filter({ hasText: "Praise classification" });
    await promptLink.click();

    await expect(page.locator('input[value="given_praise"]')).toBeVisible();
    await expect(page.locator('input[value="identifiedBy"]')).toBeVisible();
  });

  test("should navigate using sidebar", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Prompts", exact: true }).click();

    await expect(page).toHaveURL("/prompts");
    await expect(page.getByText("Praise classification")).toBeVisible();
  });

  test("should create a new prompt", async ({ page }) => {
    const timestamp = Date.now();
    const promptName = `E2E Test Prompt ${timestamp}`;

    await page.goto("/prompts");

    await page.getByRole("button", { name: "Create prompt" }).click();

    await expect(
      page.getByRole("dialog", { name: "Create a new prompt" }),
    ).toBeVisible();

    await page.getByRole("textbox", { name: "Name" }).fill(promptName);

    const annotationTypeSelect = page.locator("#annotation-type");
    await annotationTypeSelect.click();
    await page.getByRole("option", { name: "Per utterance" }).click();

    await page.getByRole("combobox").filter({ hasText: "Select team" }).click();
    await page.getByRole("option", { name: "Research Team Alpha" }).click();

    await page
      .getByRole("button", { name: "Create prompt", exact: true })
      .click();

    await expect(page).toHaveURL(/\/prompts\/[a-f0-9]+\/1$/);
    await expect(page.getByText("Prompt created")).toBeVisible();
    await expect(page.getByText(promptName)).toBeVisible();
  });

  test("should create a new version of existing prompt", async ({ page }) => {
    await page.goto("/prompts");

    const promptLink = page
      .getByRole("link")
      .filter({ hasText: "E2E Test Prompt" })
      .first();
    await promptLink.click();

    await expect(page).toHaveURL(/\/prompts\/[a-f0-9]+\/\d+$/);
    await expect(page.getByText("Versions")).toBeVisible();

    const beforeUrl = page.url();
    const beforeVersion = parseInt(beforeUrl.split("/").pop() || "1");

    await expect(page.getByText(`# ${beforeVersion}`).first()).toBeVisible();

    const versionsHeader = page
      .locator(".border-b")
      .filter({ hasText: "Versions" });
    await versionsHeader.locator("svg").click();

    await page.waitForURL((url) => {
      const newVersion = parseInt(url.pathname.split("/").pop() || "0");
      return newVersion > beforeVersion;
    });

    const afterUrl = page.url();
    const afterVersion = parseInt(afterUrl.split("/").pop() || "1");

    expect(afterVersion).toBeGreaterThan(beforeVersion);
    await expect(page.getByText(`# ${afterVersion}`).first()).toBeVisible();
  });

  test("should edit prompt title from list page", async ({ page }) => {
    await page.goto("/prompts");

    const promptItem = page
      .locator('[data-slot="item"]')
      .filter({ hasText: "E2E Test Prompt" })
      .first();
    await promptItem.getByRole("button", { name: "Open menu" }).click();

    await page.getByRole("menuitem", { name: "Edit" }).click();

    await expect(
      page.getByRole("dialog", { name: "Edit prompt" }),
    ).toBeVisible();

    const nameInput = page.getByRole("textbox", { name: "Name" });
    const originalName = await nameInput.inputValue();
    await nameInput.fill(`${originalName} (edited)`);

    await page.getByRole("button", { name: "Save prompt" }).click();

    await expect(page.getByText("Prompt updated")).toBeVisible();
    await expect(page.getByText(`${originalName} (edited)`)).toBeVisible();
  });

  test("should edit prompt title from detail page", async ({ page }) => {
    const timestamp = Date.now();
    const editedName = `E2E Edited Detail ${timestamp}`;

    await page.goto("/prompts");

    const promptLink = page
      .getByRole("link")
      .filter({ hasText: "E2E Test Prompt" })
      .first();
    await promptLink.click();

    await expect(page).toHaveURL(/\/prompts\/[a-f0-9]+\/\d+$/);

    await page.getByRole("button", { name: "Edit" }).click();

    await expect(
      page.getByRole("dialog", { name: "Edit prompt" }),
    ).toBeVisible();

    await page.getByRole("textbox", { name: "Name" }).fill(editedName);

    await page.getByRole("button", { name: "Save prompt" }).click();

    await expect(page.getByRole("link", { name: editedName })).toBeVisible();
    await expect(page.getByText("Prompt updated")).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).click();
    await page
      .getByRole("textbox", { name: "Name" })
      .fill(`E2E Test Prompt ${timestamp}`);
    await page.getByRole("button", { name: "Save prompt" }).click();

    await expect(
      page.getByRole("link", { name: `E2E Test Prompt ${timestamp}` }),
    ).toBeVisible();
    await expect(page.getByText("Prompt updated").first()).toBeVisible();
  });
});
