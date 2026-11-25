import type { Messages } from "next-intl";
import { z } from "zod";

export type PasswordErrorKey = keyof Messages["settings"]["password"]["errors"];
const error = (key: PasswordErrorKey) => ({ error: key });

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, error("currentRequired")),
    next: z
      .string()
      .min(PASSWORD_MIN_LENGTH, error("tooShort"))
      .max(PASSWORD_MAX_LENGTH, error("tooLong")),
    confirm: z.string(),
  })
  .refine((values) => values.confirm === values.next, {
    ...error("mismatch"),
    path: ["confirm"],
  })
  .refine((values) => values.next !== values.current, {
    ...error("sameAsCurrent"),
    path: ["next"],
  });

export type ChangePasswordValues = z.input<typeof changePasswordSchema>;
