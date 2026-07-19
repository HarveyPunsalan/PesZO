import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// min(8) matches peszo-api/src/modules/auth/auth.schema.ts exactly —
// verified against the backend, not guessed. Confirm this stays in sync
// if the backend schema ever changes.
