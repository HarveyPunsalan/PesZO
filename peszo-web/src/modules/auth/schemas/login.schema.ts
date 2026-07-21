import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Password is intentionally NOT validated for strength here - this is a
// login, not account creation. The backend is the only source of truth
// for whether a password is correct; client-side validation should only
// catch an empty field, never re-derive password policy.
