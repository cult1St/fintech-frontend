"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import authService from "@/services/auth.service";
import { RegisterDTO, ErrorResponse, ValidationErrors } from "@/dto/auth";
import { useAuth } from "@/context/auth-context";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";

type FieldValidationStatus = "idle" | "loading" | "valid" | "invalid";

type FieldValidationState = {
  username: FieldValidationStatus;
  email: FieldValidationStatus;
  phone: FieldValidationStatus;
};

type FieldValidationMessages = {
  username?: string;
  email?: string;
  phone?: string;
};

const RegisterPage = () => {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const [formData, setFormData] = useState<RegisterDTO>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    pin: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const pinInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Field validation state
  const [fieldValidation, setFieldValidation] = useState<FieldValidationState>({
    username: "idle",
    email: "idle",
    phone: "idle",
  });

  const [fieldValidationMessages, setFieldValidationMessages] = useState<FieldValidationMessages>({});

  // Debounce timers
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Clear debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  // Validate field with debounce
  const validateField = useCallback(
    async (fieldType: string, value: string) => {
      if (!value.trim()) {
        setFieldValidation((prev) => ({
          ...prev,
          [fieldType]: "idle",
        }));
        setFieldValidationMessages((prev) => ({
          ...prev,
          [fieldType]: undefined,
        }));
        return;
      }

      // Clear previous timer
      if (debounceTimers.current[fieldType]) {
        clearTimeout(debounceTimers.current[fieldType]);
      }

      // Set loading state immediately
      setFieldValidation((prev) => ({
        ...prev,
        [fieldType]: "loading",
      }));

      // Create new debounce timer
      debounceTimers.current[fieldType] = setTimeout(async () => {
        try {
          const response = await authService.validateField(fieldType, value);
          setFieldValidation((prev) => ({
            ...prev,
            [fieldType]: response.isValid ? "valid" : "invalid",
          }));
          setFieldValidationMessages((prev) => ({
            ...prev,
            [fieldType]: response.message,
          }));
        } catch (error: any) {
          setFieldValidation((prev) => ({
            ...prev,
            [fieldType]: "invalid",
          }));
          setFieldValidationMessages((prev) => ({
            ...prev,
            [fieldType]: error.response?.data?.message || "Validation failed",
          }));
        }
      }, 500);
    },
    []
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Phone validation - only numbers
    if (name === "phone" && !/^\d*$/.test(value)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Trigger validation for unique fields
    if (name === "username" || name === "email") {
      validateField(name, value);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // Only allow single digit

    const newPin = formData.pin.split('');
    newPin[index] = value;
    const pinStr = newPin.join('').slice(0, 4);

    setFormData((prev) => ({
      ...prev,
      pin: pinStr,
    }));

    // Move to next input if digit entered
    if (value && index < 3) {
      pinInputsRef.current[index + 1]?.focus();
    }

    if (errors.pin) {
      setErrors((prev) => ({ ...prev, pin: undefined }));
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !formData.pin[index] && index > 0) {
      pinInputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setErrors({});

    try {
      await authService.register(formData);

      showToast("Registration successful. Please verify your email.", "success");

      // Redirect to email verification page
      router.push(`/register/verify-email?email=${encodeURIComponent(formData.email)}`);
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
    <div id="page-signup" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "2rem 1rem" }}>
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
          <div className="auth-tagline">Create your free wallet in 2 minutes</div>

          <form onSubmit={handleSubmit}>
            {/* First & Last Name in row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First name</label>
                <input
                  name="fullName"
                  value={formData.fullName.split(" ")[0] || ""}
                  onChange={(e) => {
                    const firstName = e.target.value;
                    const lastName = formData.fullName.split(" ")[1] || "";
                    setFormData((prev) => ({
                      ...prev,
                      fullName: (firstName + (lastName ? " " + lastName : "")).trim(),
                    }));
                  }}
                  type="text"
                  className="form-input"
                  placeholder="Chidi"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input
                  name="lastName"
                  value={formData.fullName.split(" ")[1] || ""}
                  onChange={(e) => {
                    const firstName = formData.fullName.split(" ")[0] || "";
                    const lastName = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      fullName: (firstName + (lastName ? " " + lastName : "")).trim(),
                    }));
                  }}
                  type="text"
                  className="form-input"
                  placeholder="Okafor"
                />
              </div>
            </div>

            {/* Username */}
            <div className="form-group">
              <label className="form-label">
                Username
                {fieldValidation.username === "loading" && (
                  <span style={{ marginLeft: "8px", display: "inline-block", animation: "spin 1s linear infinite", fontSize: "12px" }}>⟳</span>
                )}
                {fieldValidation.username === "valid" && (
                  <span style={{ marginLeft: "8px", display: "inline-block", color: "var(--success, #10b981)", fontSize: "16px" }}>✓</span>
                )}
                {fieldValidation.username === "invalid" && (
                  <span style={{ marginLeft: "8px", display: "inline-block", color: "var(--error, #ef4444)", fontSize: "16px" }}>✗</span>
                )}
              </label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                type="text"
                className="form-input"
                placeholder="@wealthyman"
              />
              {fieldValidationMessages.username && (
                <small
                  className="form-error"
                  style={{
                    color: fieldValidation.username === "valid" ? "var(--success, #10b981)" : "var(--error, #ef4444)",
                  }}
                >
                  {fieldValidationMessages.username}
                </small>
              )}
              {errors.username && <small className="form-error">{errors.username}</small>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                Email address
                {fieldValidation.email === "loading" && (
                  <span style={{ marginLeft: "8px", display: "inline-block", animation: "spin 1s linear infinite", fontSize: "12px" }}>⟳</span>
                )}
                {fieldValidation.email === "valid" && (
                  <span style={{ marginLeft: "8px", display: "inline-block", color: "var(--success, #10b981)", fontSize: "16px" }}>✓</span>
                )}
                {fieldValidation.email === "invalid" && (
                  <span style={{ marginLeft: "8px", display: "inline-block", color: "var(--error, #ef4444)", fontSize: "16px" }}>✗</span>
                )}
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="form-input"
                placeholder="you@example.com"
              />
              {fieldValidationMessages.email && (
                <small
                  className="form-error"
                  style={{
                    color: fieldValidation.email === "valid" ? "var(--success, #10b981)" : "var(--error, #ef4444)",
                  }}
                >
                  {fieldValidationMessages.email}
                </small>
              )}
              {errors.email && <small className="form-error">{errors.email}</small>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Phone number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                className="form-input"
                placeholder="+234 800 000 0000"
                maxLength={11}
              />
              {errors.phone && <small className="form-error">{errors.phone}</small>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Min. 8 characters"
                />
              </div>
              {errors.password && <small className="form-error">{errors.password}</small>}
            </div>

            {/* PIN - 4 digit input */}
            <div className="form-group">
              <label className="form-label">PIN (4 digits)</label>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      if (el) pinInputsRef.current[idx] = el;
                    }}
                    type="password"
                    maxLength={1}
                    value={formData.pin[idx] || ""}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(idx, e)}
                    className="otp-cell"
                    placeholder="•"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "10px",
                    }}
                  />
                ))}
              </div>
              {errors.pin && <small className="form-error">{errors.pin}</small>}
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
              {isLoading ? "Creating Account..." : "Create account →"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="auth-link"
              style={{ cursor: "pointer" }}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
