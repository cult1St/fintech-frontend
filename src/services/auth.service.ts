import { AxiosError } from "axios";
import {
  ConfirmVerificationDTO,
  ErrorResponse,
  ForgotPasswordDTO,
  LoginDTO,
  RegisterDTO,
  ResendVerificationCodeDTO,
  ResetPasswordDTO,
  VerifyCodeDTO,
} from "@/dto/auth";
import http from "./http";

type AuthRecord = Record<string, unknown>;

class AuthService {
  private getPayloadData(payload: unknown) {
    if (!payload || typeof payload !== "object") {
      return undefined;
    }

    const root = payload as AuthRecord;
    return (root.data as AuthRecord | undefined) ?? root;
  }

  private saveAuthSession(payload: unknown) {
    if (typeof window === "undefined") {
      return;
    }

    const data = this.getPayloadData(payload);
    if (!data) {
      return;
    }

    const token =
      (data.token as string | undefined) ??
      (data.authToken as string | undefined) ??
      (data.accessToken as string | undefined) ??
      (data.access_token as string | undefined);
    const user =
      (data.user as AuthRecord | undefined) ??
      (data.profile as AuthRecord | undefined) ??
      undefined;

    if (token) {
      sessionStorage.setItem("authToken", token);
    }

    if (user) {
      sessionStorage.setItem("authUser", JSON.stringify(user));
    }
  }

  private handleError(err: unknown): never {
    const axiosError = err as AxiosError<ErrorResponse>;
    const data = axiosError.response?.data;

    if (data) {
      throw data;
    }

    throw {
      message: axiosError.message || "Network error",
      status: axiosError.response?.status,
    };
  }

  async login(formData: LoginDTO) {
    try {
      const response = await http.post("/auth/login", formData);
      this.saveAuthSession(response.data);
      return response.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async register(formData: RegisterDTO) {
    try {
      const response = await http.post("/auth/register", formData);
      this.saveAuthSession(response.data);
      return response.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async confirmVerification(payload: ConfirmVerificationDTO) {
    try {
      const response = await http.post("/auth/confirm-verification", payload);
      this.saveAuthSession(response.data);
      return response.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async resendVerificationCode(payload: ResendVerificationCodeDTO) {
    try {
      const response = await http.post(
        "/auth/register/resend-verification-code",
        payload
      );
      return response.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async forgotPassword(payload: ForgotPasswordDTO) {
    try {
      const response = await http.post("/auth/forgot-password", payload);
      return response.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async verifyCode(payload: VerifyCodeDTO) {
    try {
      const response = await http.post("/auth/verify-code", payload);
      return response.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async resetPassword(payload: ResetPasswordDTO) {
    try {
      const response = await http.post("/auth/reset-password", payload);
      return response.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async logout() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("authUser");
      sessionStorage.removeItem("walletState");
    }

    return { message: "Logged out" };
  }

  async getProfile() {
    try {
      const response = await http.get("/auth/me");
      return response.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

const authService = new AuthService();
export default authService;
