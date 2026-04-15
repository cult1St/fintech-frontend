"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import authService from "@/services/auth.service";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, showToast, removeToast } = useToast();

  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow single digit
    if (!/^\d?$/.test(value)) return;

    const codeArray = code.split("");
    codeArray[index] = value;
    const newCode = codeArray.join("").slice(0, 6);
    setCode(newCode);

    // Move to next input if digit entered
    if (value && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (code.length !== 6) {
      showToast("Please enter all 6 digits", "error");
      return;
    }

    setIsLoading(true);

    try {
      // Call verification API
      await authService.verifyEmail({ email, code });
      showToast("Email verified successfully! Redirecting to login...", "success");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      showToast(err?.message || "Verification failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;

    setResendLoading(true);

    try {
      await authService.resendVerificationCode({ email });
      showToast("Verification code sent to your email", "success");
      setResendCountdown(180); // 3 minutes
      setCode(""); // Clear the code input
    } catch (err: any) {
      showToast(err?.message || "Failed to resend code", "error");
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Mask email to show: f***@example.com
 const maskEmail = (emailStr: string) => {
    const [localPart, domain] = emailStr.split("@");
    if (!localPart || !domain) return emailStr;
    const masked = localPart[0] + "*".repeat(Math.max(localPart.length - 2, 1)) + localPart[localPart.length - 1];
    return `${masked}@${domain}`;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "2rem 1rem" }}>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <button
          onClick={() => router.push("/register")}
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
          Back
        </button>

        <div className="auth-card">
          <div className="auth-logo">Pay<span style={{ color: "var(--text)" }}>Vault</span></div>
          <div className="auth-tagline">Email verification</div>

          <p
            className="otp-info"
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: "var(--text2)",
              marginBottom: "0.5rem",
            }}
          >
            We sent a 6-digit code to<br />
            <strong>{maskEmail(email)}</strong>
          </p>

          <form onSubmit={handleVerify}>
            {/* 6-Digit Code Input */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                className="otp-grid"
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      if (el) codeInputsRef.current[idx] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={code[idx] || ""}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                    className="otp-cell"
                    placeholder="•"
                    style={{
                      width: "50px",
                      height: "56px",
                      borderRadius: "10px",
                    }}
                  />
                ))}
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text3)",
                  textAlign: "center",
                  margin: "0",
                }}
              >
                Enter the 6-digit code from your email
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="btn-primary"
              style={{
                width: "100%",
                opacity: isLoading || code.length !== 6 ? 0.6 : 1,
              }}
            >
              {isLoading ? "Verifying..." : "Verify & continue →"}
            </button>
          </form>

          <p
            className="otp-resend"
            style={{
              textAlign: "center",
              fontSize: "13px",
              color: "var(--text3)",
              marginTop: "1rem",
            }}
          >
            Didn't get it?{" "}
            <span
              onClick={handleResend}
              style={{
                color: resendCountdown > 0 ? "var(--text3)" : "var(--green)",
                cursor: resendCountdown > 0 ? "default" : "pointer",
                fontWeight: resendCountdown > 0 ? "normal" : "500",
              }}
            >
              {resendCountdown > 0 ? `Resend in ${formatTime(resendCountdown)}` : "Resend"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
