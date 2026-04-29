"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";
import { ErrorResponse, RegisterDTO, ValidationErrors } from "@/dto/auth";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";

export default function RegisterPage() {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const pinInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState<RegisterDTO>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    pin: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === "phone" && !/^\d*$/.test(value)) {
      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: undefined,
      }));
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const pinArray = formData.pin.split("");
    pinArray[index] = value;
    const nextPin = pinArray.join("").slice(0, 4);

    setFormData((current) => ({
      ...current,
      pin: nextPin,
    }));

    if (value && index < 3) {
      pinInputsRef.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !formData.pin[index] && index > 0) {
      pinInputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrors({});

    try {
      await authService.register(formData);
      showToast("Registration successful. Verify your email to continue.", "success");
      router.push(`/register/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      const error = err as ErrorResponse;

      if (error.errors) {
        setErrors(error.errors);
      }

      showToast(error.message || "Unable to create your account.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="page-signup"
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
          <div className="auth-tagline">Create your free wallet in a few steps</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                className="form-input"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Chidi Okafor"
              />
              {errors.fullName ? <small className="form-error">{errors.fullName}</small> : null}
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="@wealthbuilder"
              />
              {errors.username ? <small className="form-error">{errors.username}</small> : null}
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
              {errors.email ? <small className="form-error">{errors.email}</small> : null}
            </div>

            <div className="form-group">
              <label className="form-label">Phone number</label>
              <input
                className="form-input"
                name="phone"
                type="tel"
                maxLength={11}
                value={formData.phone}
                onChange={handleChange}
                placeholder="08030000000"
              />
              {errors.phone ? <small className="form-error">{errors.phone}</small> : null}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
              />
              {errors.password ? <small className="form-error">{errors.password}</small> : null}
            </div>

            <div className="form-group">
              <label className="form-label">Transaction PIN</label>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      pinInputsRef.current[index] = element;
                    }}
                    className="otp-cell"
                    type="password"
                    maxLength={1}
                    value={formData.pin[index] || ""}
                    onChange={(event) => handlePinChange(index, event.target.value)}
                    onKeyDown={(event) => handlePinKeyDown(index, event)}
                    placeholder="0"
                    style={{ width: "50px", height: "50px" }}
                  />
                ))}
              </div>
              {errors.pin ? <small className="form-error">{errors.pin}</small> : null}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{" "}
            <span onClick={() => router.push("/login")} className="auth-link">
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
