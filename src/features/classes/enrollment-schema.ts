import type { Messages } from "next-intl";
import { z } from "zod";
import { Constants } from "@/types/database";

export type EnrollErrorKey = keyof Messages["classes"]["enroll"]["errors"];
const error = (key: EnrollErrorKey) => ({ error: key });

export const DISCOUNT_TYPES = Constants.public.Enums.discount_type;

const FIXED_PERCENT = { none: 0, half: 50, free: 100 } as const;

const enrollmentSchema = z
  .object({
    student_id: z.guid(),
    discount_type: z.enum(DISCOUNT_TYPES),
    discount_percent: z.string().trim(),
  })
  .transform(({ student_id, discount_type, discount_percent }, ctx) => {
    if (discount_type !== "custom") {
      return { student_id, discount_type, discount_percent: FIXED_PERCENT[discount_type] };
    }

    const percent = Number(discount_percent);
    if (!/^\d{1,2}$/.test(discount_percent) || percent < 1) {
      ctx.addIssue({
        code: "custom",
        message: "percentInvalid" satisfies EnrollErrorKey,
        path: ["discount_percent"],
      });
      return z.NEVER;
    }

    return { student_id, discount_type, discount_percent: percent };
  });

export const enrollSchema = z.object({
  enrollments: z.array(enrollmentSchema).min(1, error("selectStudents")),
});

export type EnrollFormValues = z.input<typeof enrollSchema>;
export type EnrollInput = z.output<typeof enrollSchema>;
