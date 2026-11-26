import { expect, test, type Locator, type Page } from "@playwright/test";
import { signInAsAdmin, toast } from "./helpers";

async function tabTo(page: Page, target: Locator, maxSteps = 40) {
  for (let step = 0; step < maxSteps; step++) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error(`Tab never reached ${target}`);
}

async function tabAndType(page: Page, field: Locator, text: string) {
  await page.keyboard.press("Tab");
  await expect(field).toBeFocused();
  await page.keyboard.type(text);
}

test("adds a student with the keyboard only", async ({ page }) => {
  const runId = Date.now().toString().slice(-6);
  const student = { admissionNo: `KB-${runId}`, fullName: `Keyboard Student ${runId}` };

  await signInAsAdmin(page);
  await page.goto("/students");
  await expect(page.getByRole("heading", { level: 1, name: "Students" })).toBeVisible();

  await tabTo(page, page.getByRole("link", { name: "Add student" }));
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/students\/new$/);
  await expect(page.getByRole("heading", { level: 1, name: "Add student" })).toBeVisible();

  const admissionNo = page.getByRole("textbox", { name: "Admission no", exact: true });
  await tabTo(page, admissionNo);
  await page.keyboard.type(student.admissionNo);
  await tabAndType(
    page,
    page.getByRole("textbox", { name: "Full name", exact: true }),
    student.fullName,
  );

  await page.keyboard.press("Tab");
  const grade = page.getByRole("combobox", { name: "Grade", exact: true });
  await expect(grade).toBeFocused();
  for (let step = 0; step < 15 && (await grade.inputValue()) !== "10"; step++) {
    await page.keyboard.press("ArrowDown");
  }
  await expect(grade).toHaveValue("10");

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Joined on")).toBeFocused();

  const studentPhone = page.getByRole("textbox", { name: "Student phone (Optional)", exact: true });
  await tabTo(page, studentPhone, 5);
  await page.keyboard.type("0771234567");
  await tabAndType(
    page,
    page.getByRole("textbox", { name: "Parent name (Optional)", exact: true }),
    "Keyboard Parent",
  );
  await tabAndType(
    page,
    page.getByRole("textbox", { name: "Parent phone (Optional)", exact: true }),
    "0712345678",
  );

  await tabTo(page, page.getByRole("button", { name: "Save student" }), 10);
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/students\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1, name: student.fullName })).toBeVisible();
  await expect(toast(page, `${student.fullName} was added`)).toBeVisible();
});
