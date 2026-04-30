"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoginDTO, ValidationErrors } from "@/dto/auth";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/context/auth-context";
import authService from "@/services/auth.service";
import { clearFieldError, getApiErrorMessage, getApiValidationErrors } from "@/utils/api-error";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const [formData, setFormData] = useState<LoginDTO>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name] || errors.form) {
      setErrors((current) => clearFieldError(clearFieldError(current, name), "form"));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrors({});

    try {
      await authService.login(formData);
      await refreshUser();
      showToast("Login successful. Redirecting to your dashboard.", "success");
      router.push("/user/dashboard");
    } catch (err) {
      setErrors(getApiValidationErrors(err));
      showToast(getApiErrorMessage(err, "Unable to sign in right now."), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="page-login"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "2rem 1rem",
      }}
    >
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div style={{ width: "100%", maxWidth: "440px" }}>
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text2)",
            fontSize: "13px",
            marginBottom: "1.5rem",
            background: "none",
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </button>

        <div className="auth-card">
          <div className="auth-logo">
            Pay<span style={{ color: "var(--text)" }}>Vault</span>
          </div>
          <div className="auth-tagline">Welcome back to your wallet</div>

          <form onSubmit={handleSubmit}>
            {errors.form ? (
              <small className="form-error" style={{ display: "block", marginBottom: "1rem" }}>
                {errors.form}
              </small>
            ) : null}
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="your username(email or username)"
              />
              {errors.username || errors.email ? (
                <small className="form-error">{errors.username || errors.email}</small>
              ) : null}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
              />
              {errors.password ? (
                <small className="form-error">{errors.password}</small>
              ) : null}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <button
                type="button"
                className="auth-link"
                onClick={() => setShowPassword((current) => !current)}
                style={{ background: "none", fontSize: "13px" }}
              >
                {showPassword ? "Hide password" : "Show password"}
              </button>

              <Link href="/forgot-password" className="forgot-link" style={{ marginBottom: 0 }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-footer">
            Do not have an account?{" "}
            <span onClick={() => router.push("/register")} className="auth-link">
              Create one
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
