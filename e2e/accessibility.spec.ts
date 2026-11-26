import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { signInAsAdmin, signInAsStudent } from "./helpers";

const STUDENT_ID = "0505c399-09c4-1861-08d1-ff7e6623890a";
const CLASS_ID = "e29da57e-582b-ee30-5e05-c7e36824e3f5";

async function expectNoSeriousIssues(page: Page) {
  await expect(page.locator("h1").first()).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const issues = results.violations
    .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
    .map((violation) => ({
      rule: violation.id,
      impact: violation.impact,
      help: violation.help,
      targets: violation.nodes.map((node) => node.target.join(" ")),
    }));
  expect(issues, `axe issues on ${page.url()}`).toEqual([]);
}

async function receiptHref(page: Page) {
  await page.goto(`/students/${STUDENT_ID}?tab=payments`);
  const link = page.getByRole("link", { name: /^RC-\d+$/ }).first();
  return (await link.getAttribute("href"))!;
}

const adminPages = [
  "/dashboard",
  "/students",
  `/students/${STUDENT_ID}`,
  `/students/${STUDENT_ID}?tab=classes`,
  `/students/${STUDENT_ID}?tab=attendance`,
  `/students/${STUDENT_ID}?tab=payments`,
  "/students/new",
  `/students/${STUDENT_ID}/edit`,
  "/classes",
  `/classes/${CLASS_ID}`,
  "/classes/new",
  `/classes/${CLASS_ID}/edit`,
  `/attendance?class=${CLASS_ID}`,
  "/fees",
  "/fees/unpaid",
  "/reports",
  "/timetable",
  "/settings",
];

const studentPages = ["/me", "/me/attendance", "/me/payments", "/me/settings"];

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    test("login page", async ({ page }) => {
      await page.goto("/login");
      await expectNoSeriousIssues(page);
    });

    test.describe("admin pages", () => {
      test.beforeEach(async ({ page }) => {
        await signInAsAdmin(page);
      });

      for (const path of adminPages) {
        test(path, async ({ page }) => {
          await page.goto(path);
          await expectNoSeriousIssues(page);
        });
      }

      test("receipt", async ({ page }) => {
        await page.goto(await receiptHref(page));
        await expectNoSeriousIssues(page);
      });

      test("enroll students dialog", async ({ page }) => {
        await page.goto(`/classes/${CLASS_ID}`);
        await page.getByRole("button", { name: "Enroll students" }).click();
        await expect(page.getByRole("alertdialog")).toBeVisible();
        await expectNoSeriousIssues(page);
      });

      test("record payment dialog", async ({ page }) => {
        await page.goto("/fees?status=unpaid");
        await page
          .getByRole("button", { name: /^Actions for / })
          .first()
          .click();
        await page.getByRole("menuitem", { name: "Record payment" }).click();
        await expect(page.getByRole("alertdialog")).toBeVisible();
        await expectNoSeriousIssues(page);
      });

      test("confirm dialog", async ({ page }) => {
        await page.goto("/fees");
        await page.getByRole("button", { name: "Generate dues" }).click();
        await expect(page.getByRole("alertdialog")).toBeVisible();
        await expectNoSeriousIssues(page);
      });
    });

    test.describe("student pages", () => {
      test.beforeEach(async ({ page }) => {
        await signInAsStudent(page);
      });

      for (const path of studentPages) {
        test(path, async ({ page }) => {
          await page.goto(path);
          await expectNoSeriousIssues(page);
        });
      }
    });
  });
}
