import { test, expect } from "@playwright/test";

test.describe("Lexicon Pages", () => {
  test("renders a procedure lexicon page", async ({ page }) => {
    await page.goto("/docs/lexicon/com.atiproto.feed.tip.create");
    const id = page.getByTestId("lexicon-id");
    await expect(id).toContainText("com.atiproto.feed.tip.create");
    await expect(page.getByText("procedure")).toBeVisible();
    await expect(page.locator("h3", { hasText: "Input" })).toBeVisible();
    await expect(page.locator("h3", { hasText: "Output" })).toBeVisible();
    await expect(page.locator("h3", { hasText: "Usage Example" })).toBeVisible();
  });

  test("renders a query lexicon page", async ({ page }) => {
    await page.goto("/docs/lexicon/com.atiproto.account.cart.get");
    await expect(page.getByTestId("lexicon-id")).toContainText(
      "com.atiproto.account.cart.get"
    );
    await expect(page.getByRole("article").getByText("query")).toBeVisible();
    await expect(page.locator("h3", { hasText: "Parameters" })).toBeVisible();
    await expect(page.locator("h3", { hasText: "Output" })).toBeVisible();
  });

  test("renders a record type page", async ({ page }) => {
    await page.goto("/docs/lexicon/com.atiproto.tip");
    await expect(page.getByTestId("lexicon-id")).toContainText("com.atiproto.tip");
    await expect(page.getByRole("article").getByText("record", { exact: true })).toBeVisible();
    await expect(
      page.locator("h3", { hasText: "Record Schema" })
    ).toBeVisible();
  });

  test("renders the lexicon index overview", async ({ page }) => {
    await page.goto("/docs/lexicon");
    await expect(page.locator("h1")).toContainText("Lexicon Reference");
    await expect(page.locator("h2", { hasText: "Record Types" })).toBeVisible();
    // Check that lexicon links are present
    await expect(
      page.getByRole("link", { name: /com\.atiproto\.tip/ })
    ).toBeVisible();
  });

  test("returns 404 for invalid lexicon NSID", async ({ page }) => {
    const response = await page.goto("/docs/lexicon/com.atiproto.nonexistent");
    expect(response?.status()).toBe(404);
  });

  test("navigates from sidebar to a lexicon page", async ({ page }) => {
    await page.goto("/docs/get-started");
    await page.setViewportSize({ width: 1280, height: 720 });
    // Expand API Reference section
    await page.getByRole("button", { name: "API Reference" }).click();
    // Expand a namespace group
    await page.getByRole("button", { name: "feed.tip" }).click();
    // Click a method
    await page.getByRole("link", { name: "create" }).first().click();
    await expect(page).toHaveURL(/\/docs\/lexicon\/com\.atiproto\.feed\.tip\.create/);
  });
});
