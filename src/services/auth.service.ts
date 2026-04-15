import http from "./http";
import { AxiosError } from "axios";
import { RegisterDTO, ErrorResponse, LoginDTO } from "@/dto/auth";

class AuthService {
  private saveAuthSession(payload: unknown) {
    if (typeof window === "undefined" || !payload || typeof payload !== "object") {
      return;
    }

    const root = payload as Record<string, unknown>;
    const data = (root.data as Record<string, unknown> | undefined) ?? root;
    const token = data.token as string | undefined;
    const user = (data.user as Record<string, unknown> | undefined) ?? undefined;

    if (token) {
      sessionStorage.setItem("authToken", token);
    }

    if (user) {
      sessionStorage.setItem("authUser", JSON.stringify(user));
    }
  }

  async login(formData : LoginDTO) {
    try {
      const response = await http.post("/auth/login", formData);

      this.saveAuthSession(response.data);

      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const data = axiosError.response?.data;
      // Return the errors object to the caller instead of throwing Error
      return Promise.reject(data || { message: "Network error" });
    }
  }

  async register(formData: RegisterDTO) {
    try {
      const response = await http.post("/auth/register", formData);

      this.saveAuthSession(response.data);

      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const data = axiosError.response?.data;
      // Return the errors object to the caller instead of throwing Error
      return Promise.reject(data || { message: "Network error" });
    }
  }

  async logout() {
    try {
      const response = await http.delete("/auth/logout");
      if (typeof window != "undefined") {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("authUser");
      }

      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Network error";

      throw new Error(message);
    }
  }

  async getProfile() {
    try {
      const response = await http.get("/auth/me");
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Network error";

      throw new Error(message);
    }
  }

  async verifyEmail(payload: { email: string; code: string }) {
    try {
      const response = await http.post("/auth/verify-email", payload);
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const data = axiosError.response?.data;
      return Promise.reject(data || { message: "Network error" });
    }
  }

  async resendVerificationCode(payload: { email: string }) {
    try {
      const response = await http.post("/auth/resend-code", payload);
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const data = axiosError.response?.data;
      return Promise.reject(data || { message: "Network error" });
    }
  }

  async validateField(fieldType: string, value: string): Promise<{ isValid: boolean; message: string }> {
    try {
      const response = await http.get(`/auth/validate-field`, {
        params: {
          type: fieldType,
          input: value,
        },
      });
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const data = axiosError.response?.data;
      return Promise.reject(data || { message: "Validation failed" });
    }
  }
}

const authService = new AuthService();
export default authService;
