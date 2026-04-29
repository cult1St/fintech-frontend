export interface LoginDTO {
  username: string;
  password: string;
}

export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
  username: string;
  phone: string;
  pin: string;
}

export interface ConfirmVerificationDTO {
  email: string;
  code: string;
}

export interface ResendVerificationCodeDTO {
  email: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface VerifyCodeDTO {
  email: string;
  code: string;
}

export interface ResetPasswordDTO {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export interface ValidationErrors {
  [name: string]: string | undefined | null;
}

export interface ErrorResponse {
  message: string;
  errors?: ValidationErrors;
}
