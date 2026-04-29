"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import authService from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      await authService.forgotPassword({ email });
      showToast("Reset code sent. Continue to reset your password.", "success");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      showToast(
        (err as { message?: string })?.message || "Unable to start password reset.",
        "error"
      );
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
          onClick={() => router.push("/login")}
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
          Back to login
        </button>

        <div className="auth-card">
          <div className="auth-logo">
            Pay<span style={{ color: "var(--text)" }}>Vault</span>
          </div>
          <div className="auth-tagline">Request a reset code for your account</div>

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

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !email}
              style={{ opacity: isLoading || !email ? 0.6 : 1 }}
            >
              {isLoading ? "Sending reset code..." : "Send reset code"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
