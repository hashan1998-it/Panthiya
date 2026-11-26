import { expect, type Page } from "@playwright/test";

export const PASSWORD = process.env.E2E_PASSWORD ?? "Demo-Pass-2026";

export const ADMIN = { email: "admin@panthiya.test", name: "Demo Admin" };
export const STUDENT = { email: "nimal@panthiya.test", name: "Nimal Perera" };

export async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

export async function signInAsAdmin(page: Page) {
  await signIn(page, ADMIN.email);
  await expect(page).toHaveURL(/\/dashboard$/);
}

export async function signInAsStudent(page: Page) {
  await signIn(page, STUDENT.email);
  await expect(page).toHaveURL(/\/me$/);
}

export function toast(page: Page, text: string | RegExp) {
  return page.locator("[data-sonner-toast]").filter({ hasText: text });
}
