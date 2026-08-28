"use server";
import { auth } from "@/lib/auth";

export interface AuthResult {
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

export const login = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    // Better-auth returns a success object directly
    if (result && result.user) {
      return {
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            image: result.user.image,
            emailVerified: result.user.emailVerified,
            createdAt: result.user.createdAt,
            updatedAt: result.user.updatedAt,
          },
          session: result.token
            ? {
                id: result.token,
                token: result.token,
              }
            : undefined,
        },
      };
    }

    return {
      error: {
        message: "Invalid email or password",
      },
    };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : "Login failed",
      },
    };
  }
};

export const signup = async (
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> => {
  try {
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    // Better-auth returns a success object directly
    if (result && result.user) {
      return {
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            image: result.user.image,
            emailVerified: result.user.emailVerified,
            createdAt: result.user.createdAt,
            updatedAt: result.user.updatedAt,
          },
          session: result.token
            ? {
                id: result.token,
                token: result.token,
              }
            : undefined,
        },
      };
    }

    return {
      error: {
        message: "Failed to create account",
      },
    };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : "Signup failed",
      },
    };
  }
};
