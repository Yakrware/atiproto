import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("redirects /docs to /docs/get-started", async ({ page }) => {
    await page.goto("/docs");
    await expect(page).toHaveURL(/\/docs\/get-started/);
  });

  test("renders the Get Started page", async ({ page }) => {
    await page.goto("/docs/get-started");
    await expect(page.locator("h1")).toContainText("Get Started");
  });

  test("navigates to Checkout Flow via sidebar", async ({ page }) => {
    await page.goto("/docs/get-started");
    await page.setViewportSize({ width: 1280, height: 720 });
    const sidebar = page.getByTestId("sidebar-nav");
    await sidebar.getByRole("link", { name: "Checkout Flow" }).click();
    await expect(page).toHaveURL(/\/docs\/checkout/);
    await expect(page.locator("h1")).toContainText("Checkout Flow");
  });

  test("navigates to Broker Onboarding via sidebar", async ({ page }) => {
    await page.goto("/docs/get-started");
    await page.setViewportSize({ width: 1280, height: 720 });
    const sidebar = page.getByTestId("sidebar-nav");
    await sidebar.getByRole("link", { name: "Broker Onboarding" }).click();
    await expect(page).toHaveURL(/\/docs\/broker-onboarding/);
    await expect(page.locator("h1")).toContainText("Broker Onboarding");
  });

  test("home link points to /", async ({ page }) => {
    await page.goto("/docs/get-started");
    const homeLink = page.getByRole("link", { name: "atiproto" });
    await expect(homeLink).toHaveAttribute("href", "/");
  });

  test("renders sidebar with guide links", async ({ page }) => {
    await page.goto("/docs/get-started");
    await page.setViewportSize({ width: 1280, height: 720 });
    const sidebar = page.getByTestId("sidebar-nav");
    await expect(sidebar.getByText("Get Started")).toBeVisible();
    await expect(sidebar.getByText("Checkout Flow")).toBeVisible();
    await expect(sidebar.getByText("Broker Onboarding")).toBeVisible();
  });

  test("returns 404 for unknown routes", async ({ page }) => {
    const response = await page.goto("/docs/nonexistent");
    expect(response?.status()).toBe(404);
  });
});
