import { expect, test } from "@playwright/test";
import { ADMIN, signIn, signInAsAdmin, signInAsStudent, STUDENT } from "./helpers";

test.describe("root path", () => {
  test("sends a signed-out visitor to the login page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("sends an admin to the dashboard", async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("sends a student to their portal", async ({ page }) => {
    await signInAsStudent(page);
    await page.goto("/");
    await expect(page).toHaveURL(/\/me$/);
  });
});

test.describe("admin", () => {
  test("signs in and lands on the dashboard", async ({ page }) => {
    await signInAsAdmin(page);

    await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: `Account menu for ${ADMIN.name}` }),
    ).toBeVisible();
  });

  test("sees an error with a wrong password", async ({ page }) => {
    await signIn(page, ADMIN.email, "not-the-password");

    await expect(page.getByText("Invalid email or password")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("student", () => {
  test("sees only their own data", async ({ page }) => {
    await signInAsStudent(page);

    await expect(
      page.getByRole("heading", { level: 1, name: `Hello, ${STUDENT.name}` }),
    ).toBeVisible();

    await page.goto("/me/payments");
    const receipts = page.getByRole("link", { name: /^RC-\d+$/ });
    await expect(receipts.first()).toBeVisible();

    const hrefs = await receipts.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")),
    );
    for (const href of hrefs.slice(0, 2)) {
      await page.goto(href!);
      await expect(page.getByText(STUDENT.name, { exact: true })).toBeVisible();
    }
  });

  test("is sent away from admin pages", async ({ page }) => {
    await signInAsStudent(page);

    for (const path of ["/students", "/fees", "/dashboard"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/me$/);
    }
  });
});
