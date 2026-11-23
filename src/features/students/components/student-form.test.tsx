import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { TIME_ZONE } from "@/lib/dates";
import messages from "@/messages/en.json";
import { createStudent } from "../actions";
import { StudentForm } from "./student-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => "/students/new",
}));

vi.mock("../actions", () => ({
  createStudent: vi.fn(),
  updateStudent: vi.fn(),
}));

function renderForm() {
  render(
    <NextIntlClientProvider locale="en" timeZone={TIME_ZONE} messages={messages}>
      <StudentForm />
    </NextIntlClientProvider>,
  );
}

describe("StudentForm", () => {
  it("shows the required-field errors when the empty form is submitted", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Save student" }));

    const errors = await screen.findAllByRole("alert");
    expect(errors.map((error) => error.textContent)).toEqual([
      "Enter an admission number",
      "Enter the student's name",
      "Select a grade",
      "Add a student phone or a parent phone",
    ]);

    expect(screen.getByLabelText("Admission no")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Full name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Grade")).toHaveAttribute("aria-invalid", "true");
    expect(createStudent).not.toHaveBeenCalled();
  });
});
