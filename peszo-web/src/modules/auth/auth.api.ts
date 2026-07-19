import api from "@/lib/axios";
import type { LoginFormValues } from "./schemas/login.schema";
import type { RegisterFormValues } from "./schemas/register.schema";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
  accessToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

/** POST /auth/login — returns { user, accessToken } on success */
export const loginRequest = async (
  data: LoginFormValues
): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
  return res.data.data;
};

/**
 * POST /auth/register — returns { user, accessToken } on success.
 * confirmPassword is stripped before sending; the backend has no
 * concept of it — it exists purely for client-side form validation.
 * Only { email, password } goes in the actual request body.
 */
export const registerRequest = async (
  data: RegisterFormValues
): Promise<AuthResponse> => {
  const { confirmPassword: _, ...body } = data;
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/register", body);
  return res.data.data;
};
