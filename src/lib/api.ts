import { login, signup } from "@/server/users";

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      emailVerified: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    session?: {
      id: string;
      token: string;
    };
  };
  error?: {
    message: string;
    code?: string;
  };
}

export const signupUser = async (data: SignupData): Promise<AuthResponse> => {
  try {
    const result = await signup(data.name, data.email, data.password);

    if (result?.error) {
      return {
        error: {
          message: result.error.message || "Failed to create account",
          code: result.error.code,
        },
      };
    }

    return {
      data: result?.data,
    };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
    };
  }
};

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const result = await login(data.email, data.password);

    if (result?.error) {
      return {
        error: {
          message: result.error.message || "Failed to sign in",
          code: result.error.code,
        },
      };
    }

    return {
      data: result?.data,
    };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
    };
  }
};
