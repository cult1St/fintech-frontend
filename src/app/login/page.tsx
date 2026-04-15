"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginDTO, ErrorResponse, ValidationErrors } from "@/dto/auth";
import authService from "@/services/auth.service";
import { useAuth } from "@/context/auth-context";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const [formData, setFormData] = useState<LoginDTO>({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error properly (no undefined issue)
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setErrors({});

    try {
      await authService.login(formData);

      showToast("Login successful. Redirecting...", "success");

      await refreshUser();
      router.push("/user/dashboard");
    } catch (err: unknown) {
      const errData = err as ErrorResponse;

      if (errData?.errors) {
        setErrors(errData.errors);
      }

      if (errData?.message) {
        showToast(errData.message, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="page-login" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "2rem 1rem" }}>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <button
          onClick={() => router.push("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text2)",
            fontSize: "13px",
            marginBottom: "1.5rem",
            cursor: "pointer",
            background: "none",
            border: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text2)")}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </button>

        <div className="auth-card">
          <div className="auth-logo">Pay<span style={{ color: "var(--text)" }}>Vault</span></div>
          <div className="auth-tagline">Welcome back to your wallet</div>

        <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="form-input"
                placeholder="you@example.com"
              />
              {errors.email && (
                <small className="form-error">{errors.email}</small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Your password"
              />
              {errors.password && (
                <small className="form-error">{errors.password}</small>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                width: "100%",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{" "}
            <span
              onClick={() => router.push("/register")}
              className="auth-link"
              style={{ cursor: "pointer" }}
            >
              Create one free
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
