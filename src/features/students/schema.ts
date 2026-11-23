import type { Messages } from "next-intl";
import { z } from "zod";
import { normalizeSriLankanPhone } from "@/lib/phone";

export type StudentFormErrorKey = keyof Messages["students"]["form"]["errors"];
const error = (key: StudentFormErrorKey) => ({ error: key });

const optionalPhone = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (value === "") return null;

    const phone = normalizeSriLankanPhone(value);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: "phoneInvalid" satisfies StudentFormErrorKey });
      return z.NEVER;
    }
    return phone;
  });

export const studentSchema = z
  .object({
    admission_no: z
      .string()
      .trim()
      .min(1, error("admissionNoRequired"))
      .max(20, error("admissionNoTooLong"))
      .transform((value) => value.toUpperCase()),
    full_name: z
      .string()
      .trim()
      .min(1, error("fullNameRequired"))
      .max(100, error("fullNameTooLong")),
    grade: z.coerce
      .number(error("gradeRequired"))
      .int(error("gradeRequired"))
      .min(1, error("gradeRequired"))
      .max(13, error("gradeRequired")),
    phone: optionalPhone,
    parent_name: z
      .string()
      .trim()
      .max(100, error("parentNameTooLong"))
      .transform((value) => value || null),
    parent_phone: optionalPhone,
    joined_on: z.iso.date(error("joinedOnRequired")),
  })
  .refine((student) => student.phone !== null || student.parent_phone !== null, {
    ...error("contactRequired"),
    path: ["phone"],
  });

export type StudentFormValues = z.input<typeof studentSchema>;
export type StudentInput = z.output<typeof studentSchema>;

export type StudentAccountErrorKey = keyof Messages["students"]["account"]["errors"];
const accountError = (key: StudentAccountErrorKey) => ({ error: key });

export const studentAccountSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, accountError("emailTooLong"))
    .pipe(z.email(accountError("emailInvalid"))),
});

export type StudentAccountValues = z.input<typeof studentAccountSchema>;
