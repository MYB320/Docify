export interface FormState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export const initialFormState: FormState = {
  isLoading: false,
  error: null,
  success: null,
};

export const createFormActions = () => ({
  setLoading: (): FormState => ({
    isLoading: true,
    error: null,
    success: null,
  }),
  setSuccess: (message: string): FormState => ({
    isLoading: false,
    error: null,
    success: message,
  }),
  setError: (message: string): FormState => ({
    isLoading: false,
    error: message,
    success: null,
  }),
  reset: (): FormState => initialFormState,
});

export const getFieldErrorMessage = (
  error: string,
  fieldName: string
): string | null => {
  const lowerError = error.toLowerCase();
  const lowerField = fieldName.toLowerCase();

  if (lowerError.includes(lowerField)) {
    return error;
  }

  // Common field mappings
  const fieldMappings: Record<string, string[]> = {
    email: ['email', 'e-mail', 'mail'],
    password: ['password', 'pwd', 'pass'],
    name: ['name', 'username', 'user name'],
  };

  const fieldKeys = fieldMappings[lowerField] || [lowerField];

  for (const key of fieldKeys) {
    if (lowerError.includes(key)) {
      return error;
    }
  }

  return null;
};

export const validatePasswordStrength = (password: string) => {
  const requirements = [
    {
      regex: /.{8,}/,
      message: "At least 8 characters",
    },
    {
      regex: /[A-Z]/,
      message: "One uppercase letter",
    },
    {
      regex: /[a-z]/,
      message: "One lowercase letter",
    },
    {
      regex: /[0-9]/,
      message: "One number",
    },
    {
      regex: /[^A-Za-z0-9]/,
      message: "One special character",
    },
  ];

  const results = requirements.map((req) => ({
    ...req,
    met: req.regex.test(password),
  }));

  const score = results.filter((r) => r.met).length;
  const strength = score < 2 ? "weak" : score < 4 ? "medium" : "strong";

  return {
    score,
    strength,
    requirements: results,
    isValid: score >= 4, // Require at least 4 out of 5 criteria
  };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;

  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
};
