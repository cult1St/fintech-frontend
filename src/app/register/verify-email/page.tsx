"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import authService from "@/services/auth.service";
import { getApiErrorMessage } from "@/utils/api-error";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, showToast, removeToast } = useToast();
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (!resendCountdown) return;

    const timer = window.setTimeout(() => {
      setResendCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const nextCode = code.split("");
    nextCode[index] = value;
    setCode(nextCode.join("").slice(0, 6));

    if (value && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      showToast("A valid email is required to verify your account.", "error");
      return;
    }

    if (code.length !== 6) {
      showToast("Enter the full 6-digit code.", "error");
      return;
    }

    setIsLoading(true);

    try {
      await authService.confirmVerification({ email, code });
      showToast("Email verified successfully. Sign in to continue.", "success");
      router.push("/login");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Verification failed. Please try again."), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCountdown > 0 || resendLoading) {
      return;
    }

    setResendLoading(true);

    try {
      await authService.resendVerificationCode({ email });
      setCode("");
      setResendCountdown(180);
      showToast("A new verification code has been sent.", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Unable to resend code."), "error");
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${remainder.toString().padStart(2, "0")}`;
  };

  const maskEmail = (emailValue: string) => {
    const [localPart, domain] = emailValue.split("@");
    if (!localPart || !domain) return emailValue;
    if (localPart.length <= 2) return `${localPart[0] || ""}*@${domain}`;
    return `${localPart[0]}${"*".repeat(localPart.length - 2)}${localPart[localPart.length - 1]}@${domain}`;
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
          onClick={() => router.push("/register")}
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
          <div className="auth-tagline">Verify your email address</div>

          <p className="otp-info">
            We sent a 6-digit code to
            <br />
            <strong>{maskEmail(email)}</strong>
          </p>

          <form onSubmit={handleVerify}>
            <div className="otp-grid">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={(element) => {
                    codeInputsRef.current[index] = element;
                  }}
                  className="otp-cell"
                  type="text"
                  maxLength={1}
                  value={code[index] || ""}
                  onChange={(event) => handleCodeChange(index, event.target.value)}
                  onKeyDown={(event) => handleCodeKeyDown(index, event)}
                  placeholder="0"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="btn-primary"
              style={{ opacity: isLoading || code.length !== 6 ? 0.6 : 1 }}
            >
              {isLoading ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <p className="otp-resend">
            Did not get it?{" "}
            <span
              onClick={handleResend}
              style={{
                color: resendCountdown > 0 ? "var(--text3)" : "var(--green)",
                cursor: resendCountdown > 0 ? "default" : "pointer",
                fontWeight: 500,
              }}
            >
              {resendLoading
                ? "Sending..."
                : resendCountdown > 0
                  ? `Resend in ${formatTime(resendCountdown)}`
                  : "Resend code"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
