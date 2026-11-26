import { expect, test, type Page } from "@playwright/test";
import { signInAsAdmin, toast } from "./helpers";

test.describe.configure({ mode: "serial" });

const runId = Date.now().toString().slice(-6);
const newStudent = {
  admissionNo: `E2E-${runId}`,
  fullName: `E2E Student ${runId}`,
  phone: "0771234567",
};

let classId: string;

async function openMathsGrade10(page: Page) {
  await page.goto("/timetable");
  await page
    .getByRole("link", { name: /^Maths · Grade 10, / })
    .first()
    .click();
  await expect(page).toHaveURL(/\/classes\/[0-9a-f-]{36}$/);
  return page.url().split("/").pop()!;
}

test.beforeEach(async ({ page }) => {
  await signInAsAdmin(page);
});

test("adds a student", async ({ page }) => {
  await page.goto("/students/new");

  await page.getByLabel("Admission no").fill(newStudent.admissionNo);
  await page.getByLabel("Full name").fill(newStudent.fullName);
  await page.getByLabel("Grade").selectOption("10");
  await page.getByLabel("Student phone").fill(newStudent.phone);
  await page.getByRole("button", { name: "Save student" }).click();

  await expect(page).toHaveURL(/\/students\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1, name: newStudent.fullName })).toBeVisible();
  await expect(toast(page, `${newStudent.fullName} was added`)).toBeVisible();
});

test("enrolls the student in a class", async ({ page }) => {
  classId = await openMathsGrade10(page);

  await page.getByRole("button", { name: "Enroll students" }).click();
  const dialog = page.getByRole("alertdialog");
  await dialog.getByRole("searchbox").fill(newStudent.admissionNo);
  await dialog.getByRole("checkbox", { name: newStudent.fullName }).check();
  await dialog.getByRole("button", { name: "Enroll 1 student" }).click();

  await expect(toast(page, "1 student was enrolled")).toBeVisible();
  await expect(
    page.getByRole("table", { name: "Enrolled students" }).getByText(newStudent.fullName),
  ).toBeVisible();
});

test("marks attendance", async ({ page }) => {
  classId ??= await openMathsGrade10(page);
  await page.goto(`/attendance?class=${classId}`);

  const students = page.getByRole("list", { name: "Students in this session" });
  const firstStudent = students.getByRole("radiogroup").first();
  await expect(firstStudent).toBeVisible();

  for (const status of ["Late", "Present"]) {
    const option = firstStudent.getByRole("radio", { name: status, exact: true });
    if ((await option.getAttribute("aria-checked")) !== "true") {
      await option.click();
      break;
    }
  }
  await page.getByRole("button", { name: "Save attendance" }).click();

  await expect(toast(page, "1 mark saved")).toBeVisible();
  await expect(page.getByText("All changes saved")).toBeVisible();
});

test("records a payment and voids it", async ({ page }) => {
  await page.goto("/fees");

  await page.getByRole("button", { name: "Generate dues" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Generate dues" }).click();
  await expect(toast(page, /dues were created|due was created|already exist/)).toBeVisible();

  await page.goto("/fees?status=unpaid");
  const row = page
    .getByRole("row")
    .filter({ has: page.getByRole("button", { name: /^Actions for / }) })
    .first();
  const studentName = (await row
    .getByRole("button", { name: /^Actions for / })
    .getAttribute("aria-label"))!.replace("Actions for ", "");

  await row.getByRole("button", { name: /^Actions for / }).click();
  await page.getByRole("menuitem", { name: "Record payment" }).click();

  const recordDialog = page.getByRole("alertdialog");
  await expect(recordDialog.getByText(studentName)).toBeVisible();
  await recordDialog.getByLabel("Amount (Rs.)").fill("100");
  await recordDialog.getByRole("button", { name: "Record payment" }).click();

  const recorded = toast(page, /^Payment recorded\. Receipt RC-\d+$/);
  await expect(recorded).toBeVisible();
  const receiptNo = (await recorded.textContent())!.match(/RC-\d+/)![0];

  await page.goto("/fees?status=partial");
  const paidRow = page
    .getByRole("row")
    .filter({ has: page.getByRole("button", { name: `Actions for ${studentName}` }) })
    .first();
  await paidRow.getByRole("button", { name: `Actions for ${studentName}` }).click();
  await page.getByRole("menuitem", { name: "Payments" }).click();

  const paymentsDialog = page.getByRole("alertdialog", { name: "Payments" });
  await paymentsDialog.getByRole("button", { name: `Void receipt ${receiptNo}` }).click();
  await page
    .getByRole("alertdialog", { name: `Void receipt ${receiptNo}?` })
    .getByRole("button", { name: "Void" })
    .click();

  await expect(toast(page, `Receipt ${receiptNo} was voided`)).toBeVisible();
});
