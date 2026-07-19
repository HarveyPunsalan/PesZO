import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "@/modules/auth/auth.api";
import { useAuthStore } from "@/modules/auth/auth.store";
import { LoginForm } from "@/modules/auth/components/LoginForm";
import type { AxiosError } from "axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [errorMessage, setErrorMessage] = useState<string>();

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setAuth(data.accessToken);
      navigate("/dashboard");
    },
    // Backend error handler returns { success: false, error: string, timestamp: string }
    // - the key is "error", not "message". Asymmetric with the success shape
    // ({ success: true, data: T, timestamp: string }) by design: the error-handler
    // middleware in peszo-api/src/middleware/error-handler.ts serializes AppError
    // messages into the "error" key, while controllers use successResponse() which
    // wraps payloads in "data".
    onError: (error: AxiosError<{ success: boolean; error: string }>) => {
      const message =
        error.response?.data?.error ?? "Something went wrong. Please try again.";
      setErrorMessage(message);
    },
  });

  return (
    <LoginForm
      onSubmit={(data) => {
        setErrorMessage(undefined);
        mutation.mutate(data);
      }}
      isPending={mutation.isPending}
      errorMessage={errorMessage}
    />
  );
}
