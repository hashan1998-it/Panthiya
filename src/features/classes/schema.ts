import type { Messages } from "next-intl";
import { z } from "zod";

export type ClassFormErrorKey = keyof Messages["classes"]["form"]["errors"];
const error = (key: ClassFormErrorKey) => ({ error: key });

const time = (requiredKey: ClassFormErrorKey) =>
  z.iso.time({ precision: -1, ...error(requiredKey) });

const classTimes = z.object({
  start_time: time("startTimeRequired"),
  end_time: time("endTimeRequired"),
});

export const classSchema = z
  .object({
    subject: z.string().trim().min(1, error("subjectRequired")).max(50, error("subjectTooLong")),
    grade: z.coerce
      .number(error("gradeRequired"))
      .int(error("gradeRequired"))
      .min(1, error("gradeRequired"))
      .max(13, error("gradeRequired")),
    day_of_week: z
      .string()
      .regex(/^[0-6]$/, error("dayRequired"))
      .transform(Number),
    ...classTimes.shape,
    monthly_fee: z
      .string()
      .trim()
      .transform((value) => value.replaceAll(",", ""))
      .pipe(
        z
          .string()
          .min(1, { ...error("feeRequired"), abort: true })
          .regex(/^\d{1,8}(\.\d{1,2})?$/, error("feeInvalid"))
          .transform(Number)
          .pipe(z.number().positive(error("feePositive"))),
      ),
  })
  .refine((klass) => klass.end_time > klass.start_time, {
    ...error("endTimeAfterStart"),
    path: ["end_time"],
    when: (payload) => classTimes.safeParse(payload.value).success,
  });

export type ClassFormValues = z.input<typeof classSchema>;
export type ClassInput = z.output<typeof classSchema>;
