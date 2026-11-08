import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("emailInvalid").trim().toLowerCase(),
  password: z.string().min(1, "passwordRequired").max(200, "tooLong"),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "passwordRequired").max(200, "tooLong"),
  newPassword: z.string().min(8, "passwordShort").max(200, "tooLong"),
});

export type LoginValues = z.input<typeof loginSchema>;
export type PasswordValues = z.input<typeof passwordSchema>;
