export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export const AUTH_ERROR_CODES = {
  INVALID_EMAIL: "INVALID_EMAIL",
  INVALID_PASSWORD: "INVALID_PASSWORD",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  WEAK_PASSWORD: "WEAK_PASSWORD",
  NETWORK_ERROR: "NETWORK_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export const AUTH_ERROR_MESSAGES = {
  [AUTH_ERROR_CODES.INVALID_EMAIL]: "Please enter a valid email address",
  [AUTH_ERROR_CODES.INVALID_PASSWORD]: "Invalid password",
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: "No account found with this email address",
  [AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS]:
    "An account with this email already exists",
  [AUTH_ERROR_CODES.WEAK_PASSWORD]:
    "Password must be at least 8 characters long and contain uppercase, lowercase, and numbers",
  [AUTH_ERROR_CODES.NETWORK_ERROR]:
    "Network error. Please check your connection and try again",
  [AUTH_ERROR_CODES.SERVER_ERROR]: "Server error. Please try again later",
  [AUTH_ERROR_CODES.VALIDATION_ERROR]: "Please check your input and try again",
} as const;

export const parseAuthError = (error: string | Error): AuthError => {
  const message = error instanceof Error ? error.message : error;
  const lowerMessage = message.toLowerCase();

  // Map common error patterns to our error codes
  if (lowerMessage.includes("email") && lowerMessage.includes("invalid")) {
    return {
      code: AUTH_ERROR_CODES.INVALID_EMAIL,
      message: AUTH_ERROR_MESSAGES.INVALID_EMAIL,
      field: "email",
    };
  }

  if (lowerMessage.includes("password") && lowerMessage.includes("invalid")) {
    return {
      code: AUTH_ERROR_CODES.INVALID_PASSWORD,
      message: AUTH_ERROR_MESSAGES.INVALID_PASSWORD,
      field: "password",
    };
  }

  if (
    lowerMessage.includes("user not found") ||
    lowerMessage.includes("account not found")
  ) {
    return {
      code: AUTH_ERROR_CODES.USER_NOT_FOUND,
      message: AUTH_ERROR_MESSAGES.USER_NOT_FOUND,
      field: "email",
    };
  }

  if (
    lowerMessage.includes("email already exists") ||
    lowerMessage.includes("user already exists")
  ) {
    return {
      code: AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
      message: AUTH_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      field: "email",
    };
  }

  if (
    lowerMessage.includes("password") &&
    (lowerMessage.includes("weak") || lowerMessage.includes("strength"))
  ) {
    return {
      code: AUTH_ERROR_CODES.WEAK_PASSWORD,
      message: AUTH_ERROR_MESSAGES.WEAK_PASSWORD,
      field: "password",
    };
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("connection")) {
    return {
      code: AUTH_ERROR_CODES.NETWORK_ERROR,
      message: AUTH_ERROR_MESSAGES.NETWORK_ERROR,
    };
  }

  if (lowerMessage.includes("server") || lowerMessage.includes("internal")) {
    return {
      code: AUTH_ERROR_CODES.SERVER_ERROR,
      message: AUTH_ERROR_MESSAGES.SERVER_ERROR,
    };
  }

  // Default to original message if no pattern matches
  return {
    code: AUTH_ERROR_CODES.VALIDATION_ERROR,
    message: message || AUTH_ERROR_MESSAGES.VALIDATION_ERROR,
  };
};

export const getFieldFromError = (error: AuthError): string | null => {
  return error.field || null;
};

export const isRetryableError = (error: AuthError): boolean => {
  return [
    AUTH_ERROR_CODES.NETWORK_ERROR,
    AUTH_ERROR_CODES.SERVER_ERROR,
  ].includes(
    error.code as
      | typeof AUTH_ERROR_CODES.NETWORK_ERROR
      | typeof AUTH_ERROR_CODES.SERVER_ERROR,
  );
};

export const shouldShowToast = (error: AuthError): boolean => {
  const fieldErrors = [
    AUTH_ERROR_CODES.INVALID_EMAIL,
    AUTH_ERROR_CODES.INVALID_PASSWORD,
    AUTH_ERROR_CODES.WEAK_PASSWORD,
    AUTH_ERROR_CODES.VALIDATION_ERROR,
  ] as const;
  return !fieldErrors.includes(error.code as any);
};

export const formatErrorForField = (error: AuthError): string => {
  return error.message;
};

export const createAuthErrorHandler = () => {
  return {
    parseError: parseAuthError,
    getField: getFieldFromError,
    isRetryable: isRetryableError,
    shouldShowToast: shouldShowToast,
    formatForField: formatErrorForField,
  };
};
