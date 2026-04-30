import { AxiosError } from "axios";
import type { ErrorResponse, ValidationErrors } from "@/dto/auth";

type ErrorRecord = Record<string, unknown>;

function normalizeValidationValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => normalizeValidationValue(item))
      .filter(Boolean) as string[];
    return parts.length ? parts.join(", ") : undefined;
  }

  if (value && typeof value === "object") {
    const record = value as ErrorRecord;
    return (
      normalizeValidationValue(record.message) ||
      normalizeValidationValue(record.defaultMessage) ||
      normalizeValidationValue(record.error)
    );
  }

  return undefined;
}

export function normalizeValidationErrors(raw: unknown): ValidationErrors | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return undefined;
  }

  const record = raw as ErrorRecord;
  const normalized: ValidationErrors = {};

  Object.entries(record).forEach(([key, value]) => {
    const message = normalizeValidationValue(value);
    if (message) {
      normalized[key] = message;
    }
  });

  return Object.keys(normalized).length ? normalized : undefined;
}

export function normalizeApiError(error: unknown, fallback = "Network error"): ErrorResponse {
  const axiosError = error as AxiosError<ErrorRecord>;
  const responseData = axiosError.response?.data;

  if (responseData && typeof responseData === "object") {
    const data = responseData as ErrorRecord;
    const message =
      normalizeValidationValue(data.message) ||
      normalizeValidationValue(data.error) ||
      normalizeValidationValue(data.detail) ||
      normalizeValidationValue(data.title) ||
      fallback;
    const errors =
      normalizeValidationErrors(data.errors) ||
      normalizeValidationErrors(data.fieldErrors) ||
      normalizeValidationErrors(data.validationErrors);
    const normalizedErrors =
      errors && Object.keys(errors).length
        ? errors
        : message
          ? { form: message }
          : undefined;

    return {
      message,
      errors: normalizedErrors,
      status:
        typeof data.status === "number"
          ? data.status
          : axiosError.response?.status,
      success:
        typeof data.success === "boolean" ? data.success : undefined,
    };
  }

  if (error && typeof error === "object") {
    const record = error as ErrorRecord;
    const message =
      normalizeValidationValue(record.message) ||
      normalizeValidationValue(record.error) ||
      fallback;
    const errors = normalizeValidationErrors(record.errors);

    return {
      message,
      errors:
        errors && Object.keys(errors).length
          ? errors
          : message
            ? { form: message }
            : undefined,
      status:
        typeof record.status === "number"
          ? record.status
          : axiosError.response?.status,
      success:
        typeof record.success === "boolean" ? record.success : undefined,
    };
  }

  return {
    message: axiosError.message || fallback,
    status: axiosError.response?.status,
  };
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  return normalizeApiError(error, fallback).message || fallback;
}

export function getApiValidationErrors(error: unknown) {
  return normalizeApiError(error).errors || {};
}

export function clearFieldError(errors: ValidationErrors, field: string): ValidationErrors {
  if (!errors[field]) {
    return errors;
  }

  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}
