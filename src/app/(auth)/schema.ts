import type { Messages } from "next-intl";
import z from "zod";

export type SignInErrorKey = keyof Messages["auth"]["signIn"]["errors"];
const error = (key: SignInErrorKey) => ({ error: key });

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email(error("invalidEmail"))),
  password: z.string().min(1, error("passwordRequired")),
});

export type SignInInput = z.infer<typeof signInSchema>;
