import { test, expect } from "@playwright/test";

test.describe("OMNIX Frontend Smoke Foundation", () => {
  test("root container renders successfully", async ({ page }) => {
    await page.goto("/");
    const root = page.locator("#root");
    await expect(root).toBeVisible();
  });
});
