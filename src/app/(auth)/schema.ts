import type { Messages } from "next-intl";
import * as z from "zod/mini";

export type SignInErrorKey = keyof Messages["auth"]["signIn"]["errors"];
const error = (key: SignInErrorKey) => ({ error: key });

export const signInSchema = z.object({
  email: z.pipe(z.string().check(z.trim()), z.email(error("invalidEmail"))),
  password: z.string().check(z.minLength(1, error("passwordRequired"))),
});

export type SignInInput = z.infer<typeof signInSchema>;
