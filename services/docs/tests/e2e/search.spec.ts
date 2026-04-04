import { test, expect } from "@playwright/test";

test.describe("Search", () => {
  test("shows search input in header", async ({ page }) => {
    await page.goto("/docs/get-started");
    const input = page.getByTestId("search-input");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("placeholder", "Search lexicons...");
  });

  test("shows results when typing a query", async ({ page }) => {
    await page.goto("/docs/get-started");
    await page.waitForLoadState("networkidle");
    const input = page.getByTestId("search-input");
    await input.click();
    await input.pressSequentially("tip", { delay: 50 });
    const results = page.getByTestId("search-results");
    await expect(results).toBeVisible({ timeout: 10000 });
    await expect(results.getByText("com.atiproto.tip")).toBeVisible();
  });

  test("navigates to a result on click", async ({ page }) => {
    await page.goto("/docs/get-started");
    await page.waitForLoadState("networkidle");
    const input = page.getByTestId("search-input");
    await input.click();
    await input.pressSequentially("cancel", { delay: 50 });
    const results = page.getByTestId("search-results");
    await expect(results).toBeVisible({ timeout: 10000 });
    await results.locator("a").first().click();
    await expect(page).toHaveURL(/\/docs\/lexicon\/com\.atiproto/);
  });

  test("navigates to result with keyboard", async ({ page }) => {
    await page.goto("/docs/get-started");
    await page.waitForLoadState("networkidle");
    const input = page.getByTestId("search-input");
    await input.click();
    await input.pressSequentially("profile", { delay: 50 });
    await expect(page.getByTestId("search-results")).toBeVisible({ timeout: 10000 });
    await input.press("ArrowDown");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/docs\/lexicon\/com\.atiproto/, { timeout: 10000 });
  });

  test("clears results on Escape", async ({ page }) => {
    await page.goto("/docs/get-started");
    await page.waitForLoadState("networkidle");
    const input = page.getByTestId("search-input");
    await input.click();
    await input.pressSequentially("tip", { delay: 50 });
    await expect(page.getByTestId("search-results")).toBeVisible({ timeout: 10000 });
    await input.press("Escape");
    await expect(page.getByTestId("search-results")).not.toBeVisible();
  });

  test("shows no results for gibberish query", async ({ page }) => {
    await page.goto("/docs/get-started");
    await page.waitForLoadState("networkidle");
    const input = page.getByTestId("search-input");
    await input.click();
    await input.pressSequentially("xyznonexistent999", { delay: 30 });
    // Wait a moment for any results that might appear
    await page.waitForTimeout(500);
    await expect(page.getByTestId("search-results")).not.toBeVisible();
  });
});
