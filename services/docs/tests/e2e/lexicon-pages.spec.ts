import { test, expect } from "@playwright/test";

test.describe("Lexicon Pages", () => {
  test("renders a procedure lexicon page", async ({ page }) => {
    await page.goto("/docs/lexicon/com.atiproto.payment.item.create");
    const id = page.getByTestId("lexicon-id");
    await expect(id).toContainText("com.atiproto.payment.item.create");
    await expect(page.getByText("procedure")).toBeVisible();
    await expect(page.locator("h3", { hasText: "Input" })).toBeVisible();
    await expect(page.locator("h3", { hasText: "Output" })).toBeVisible();
    await expect(page.locator("h3", { hasText: "Usage Example" })).toBeVisible();
  });

  test("renders a query lexicon page", async ({ page }) => {
    await page.goto("/docs/lexicon/com.atiproto.payment.cart.get");
    await expect(page.getByTestId("lexicon-id")).toContainText(
      "com.atiproto.payment.cart.get",
    );
    await expect(page.getByRole("article").getByText("query")).toBeVisible();
    await expect(page.locator("h3", { hasText: "Parameters" })).toBeVisible();
    await expect(page.locator("h3", { hasText: "Output" })).toBeVisible();
  });

  test("renders a record type page", async ({ page }) => {
    await page.goto("/docs/lexicon/com.atiproto.item");
    await expect(page.getByTestId("lexicon-id")).toContainText(
      "com.atiproto.item",
    );
    // Scope to the type-badge class — the word "record" also appears inside
    // the syntax-highlighted Record Schema code block (as a property key in
    // the JSON), so a generic getByText match is ambiguous for records.
    await expect(
      page.getByRole("article").locator(".bg-badge-record"),
    ).toBeVisible();
    await expect(
      page.locator("h3", { hasText: "Record Schema" }),
    ).toBeVisible();
  });

  test("renders the lexicon index overview", async ({ page }) => {
    await page.goto("/docs/lexicon");
    await expect(page.locator("h1")).toContainText("Lexicon Reference");
    await expect(page.locator("h2", { hasText: "Record Types" })).toBeVisible();
    // The index lists record types — `com.atiproto.item` is a record;
    // `com.atiproto.payment` is a namespace, not a record.
    await expect(
      page.getByRole("link", { name: /com\.atiproto\.item/ }),
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
    // Expand a namespace group — `exact: true` because `payment.item` is
    // also a substring of `recipient.payment.item`.
    await page
      .getByRole("button", { name: "payment.item", exact: true })
      .click();
    // Click a method
    await page.getByRole("link", { name: "create" }).first().click();
    await expect(page).toHaveURL(
      /\/docs\/lexicon\/com\.atiproto\.payment\.item\.create/,
    );
  });
});
