import { expect, test, type Locator, type Page } from "@playwright/test";
import { signInAsAdmin } from "./helpers";

const CLASS_ID = "e29da57e-582b-ee30-5e05-c7e36824e3f5";
const STUDENT_ID = "0505c399-09c4-1861-08d1-ff7e6623890a";
const STUDENT_WITHOUT_LOGIN_ID = "419a0281-843c-d00e-34b4-0fb0e0f562d1";

async function focusIsInside(container: Locator) {
  return container.evaluate((element) => element.contains(document.activeElement));
}

async function expectFocusTrapped(page: Page, dialog: Locator) {
  await expect.poll(() => focusIsInside(dialog)).toBe(true);
  for (const key of ["Tab", "Shift+Tab"]) {
    for (let step = 0; step < 10; step++) {
      await page.keyboard.press(key);
      await expect
        .poll(() => focusIsInside(dialog), { message: `${key} #${step + 1} left the dialog` })
        .toBe(true);
    }
  }
}

async function expectClosesOnEscape(page: Page, dialog: Locator, trigger: Locator) {
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
}

async function openRowMenu(page: Page, status: string) {
  await page.goto(`/fees?status=${status}`);
  const trigger = page.getByRole("button", { name: /^Actions for / }).first();
  await trigger.click();
  return trigger;
}

test.beforeEach(async ({ page }) => {
  await signInAsAdmin(page);
});

test.describe("dialogs trap focus, close on Escape and return focus", () => {
  test("enroll students", async ({ page }) => {
    await page.goto(`/classes/${CLASS_ID}`);
    const trigger = page.getByRole("button", { name: "Enroll students" });
    await trigger.click();

    const dialog = page.getByRole("alertdialog");
    await expectFocusTrapped(page, dialog);
    await expectClosesOnEscape(page, dialog, trigger);
  });

  test("generate dues", async ({ page }) => {
    await page.goto("/fees");
    const trigger = page.getByRole("button", { name: "Generate dues" });
    await trigger.click();

    const dialog = page.getByRole("alertdialog");
    await expectFocusTrapped(page, dialog);
    await expectClosesOnEscape(page, dialog, trigger);
  });

  test("record payment", async ({ page }) => {
    const trigger = await openRowMenu(page, "unpaid");
    await page.getByRole("menuitem", { name: "Record payment" }).click();

    const dialog = page.getByRole("alertdialog");
    await expectFocusTrapped(page, dialog);
    await expectClosesOnEscape(page, dialog, trigger);
  });

  test("payments and void receipt", async ({ page }) => {
    const trigger = await openRowMenu(page, "paid");
    await page.getByRole("menuitem", { name: "Payments" }).click();

    const payments = page.getByRole("alertdialog", { name: "Payments" });
    await expectFocusTrapped(page, payments);

    const voidButton = payments.getByRole("button", { name: /^Void receipt / }).first();
    await voidButton.click();
    const confirm = page.getByRole("alertdialog", { name: /^Void receipt RC-\d+\?$/ });
    await expectFocusTrapped(page, confirm);
    await expectClosesOnEscape(page, confirm, voidButton);

    await expectClosesOnEscape(page, payments, trigger);
  });

  test("deactivate student", async ({ page }) => {
    await page.goto(`/students/${STUDENT_ID}`);
    const trigger = page.getByRole("button", { name: "Deactivate" });
    await trigger.click();

    const dialog = page.getByRole("alertdialog");
    await expectFocusTrapped(page, dialog);
    await expectClosesOnEscape(page, dialog, trigger);
  });

  test("create student login", async ({ page }) => {
    await page.goto(`/students/${STUDENT_WITHOUT_LOGIN_ID}`);
    const trigger = page.getByRole("button", { name: "Create login" });
    await trigger.click();

    const dialog = page.getByRole("alertdialog");
    await expectFocusTrapped(page, dialog);
    await expectClosesOnEscape(page, dialog, trigger);
  });

  test("mobile navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/dashboard");
    const trigger = page.getByRole("button", { name: "Open menu" });
    await trigger.click();

    const sheet = page.getByRole("dialog");
    await expectFocusTrapped(page, sheet);
    await expectClosesOnEscape(page, sheet, trigger);
  });
});

test.describe("menus move focus inside, close on Escape and return focus", () => {
  const menus: { name: string; path: string; trigger: (page: Page) => Locator }[] = [
    {
      name: "account menu",
      path: "/dashboard",
      trigger: (page) => page.getByRole("button", { name: /^Account menu for / }),
    },
    {
      name: "language menu",
      path: "/dashboard",
      trigger: (page) => page.getByRole("button", { name: /^Language: / }),
    },
    {
      name: "theme menu",
      path: "/dashboard",
      trigger: (page) => page.getByRole("button", { name: /^Theme: / }),
    },
    {
      name: "student row menu",
      path: "/students",
      trigger: (page) => page.getByRole("button", { name: /^Actions for / }).first(),
    },
    {
      name: "class row menu",
      path: "/classes",
      trigger: (page) => page.getByRole("button", { name: /^Actions for / }).first(),
    },
    {
      name: "due row menu",
      path: "/fees",
      trigger: (page) => page.getByRole("button", { name: /^Actions for / }).first(),
    },
  ];

  for (const { name, path, trigger: getTrigger } of menus) {
    test(name, async ({ page }) => {
      await page.goto(path);
      const trigger = getTrigger(page);
      await trigger.focus();
      await page.keyboard.press("Enter");

      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      await expect.poll(() => focusIsInside(menu)).toBe(true);
      await page.keyboard.press("ArrowDown");
      expect(await focusIsInside(menu)).toBe(true);

      await expectClosesOnEscape(page, menu, trigger);
    });
  }
});
