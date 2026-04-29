"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import authService from "@/services/auth.service";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, showToast, removeToast } = useToast();

  const emailFromQuery = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setIsLoading(true);

    try {
      await authService.verifyCode({ email, code });
      await authService.resetPassword({
        email,
        code,
        password,
        confirmPassword,
      });
      showToast("Password reset successful. Sign in with your new password.", "success");
      router.push("/login");
    } catch (err) {
      showToast((err as { message?: string })?.message || "Unable to reset password.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
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
          onClick={() => router.push("/forgot-password")}
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
          Back
        </button>

        <div className="auth-card">
          <div className="auth-logo">
            Pay<span style={{ color: "var(--text)" }}>Vault</span>
          </div>
          <div className="auth-tagline">Enter the reset code and choose a new password</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reset code</label>
              <input
                className="form-input"
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Enter the 6-digit code"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="New password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm new password</label>
              <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat new password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !email || !code || !password || !confirmPassword}
              style={{
                opacity:
                  isLoading || !email || !code || !password || !confirmPassword ? 0.6 : 1,
              }}
            >
              {isLoading ? "Resetting password..." : "Reset password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
