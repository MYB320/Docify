"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { BorderTrail } from "@/components/ui/border-trail";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { parseAuthError, shouldShowToast } from "@/lib/auth-errors";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = form;

  const loginWithGoogle = useMutation({
    mutationFn: async () => {
      await authClient.signIn.social({
        provider: "google",
      });
    },
    onMutate: () => {
      setIsVisible(true);
    },
    onSuccess: () => {
      toast.success("Welcome back! You've been logged in successfully.");

      setTimeout(() => {
        router.push("/documents");
      }, 2000);
    },
    onError: (error) => {
      const authError = parseAuthError(error);
      toast.error(authError.message);
      setIsVisible(false);
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onMutate: () => {
      setIsVisible(true);
    },
    onSuccess: (response) => {
      if (response.error) {
        const authError = parseAuthError(response.error.message);

        if (authError.field) {
          setError(authError.field as "email" | "password", {
            message: authError.message,
          });
        }

        if (shouldShowToast(authError)) {
          toast.error(authError.message);
        }

        setIsVisible(false);
      } else {
        toast.success("Welcome back! You've been logged in successfully.");
        // Reset form
        reset();
        // Small delay before redirect for better UX
        setTimeout(() => {
          router.push("/documents");
        }, 1500);
      }
    },
    onError: (error) => {
      const authError = parseAuthError(error);
      toast.error(authError.message);
      setIsVisible(false);
    },
  });

  const handleAnimationComplete = () => {
    if (!loginMutation.isPending || !loginWithGoogle.isPending) {
      setTimeout(() => setIsVisible(false), 300);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Clear any previous errors
    clearErrors();

    loginMutation.mutate({
      email: values.email,
      password: values.password,
    });
  }

  return (
    <form
      className={cn("rounded-lg", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      {isVisible && (
        <BorderTrail
          className={cn(
            "bg-primary transition-opacity duration-300",
            loginMutation.isPending || loginWithGoogle.isPending
              ? "opacity-100"
              : "opacity-0"
          )}
          size={160}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
      <FieldGroup className="gap-6">
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            {...register("email")}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.password}>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="*******"
            required
            {...register("password")}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </Field>

        <Field>
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={loginMutation.isPending || loginWithGoogle.isPending}
          >
            {loginMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button
            className="cursor-pointer"
            variant="outline"
            type="button"
            disabled={loginMutation.isPending || loginWithGoogle.isPending}
            onClick={() => loginWithGoogle.mutate()}
          >
            {loginWithGoogle.isPending ? (
              <Spinner className="mr-2 h-4 w-4" />
            ) : (
              <img src="/googleIcon.svg" alt="Google logo" />
            )}
            {loginWithGoogle.isPending
              ? "Logging in with Google ..."
              : "Login with Google"}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
