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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { signupUser } from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { parseAuthError, shouldShowToast } from "@/lib/auth-errors";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Layers, CheckCircle2 } from "lucide-react";

const formSchema = z
  .object({
    name: z
      .string()
      .min(4, { message: "Your fullname must be at least 4 characters long" })
      .max(50),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "free";
  const billingFrequency = searchParams.get("billing") || "annual";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
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

  const planDetails = {
    free: {
      name: "Free Plan",
      price: "$0 / forever",
      icon: <Layers className="h-4 w-4 text-muted-foreground" />,
      badge: "Standard",
    },
    plus: {
      name: "Plus Plan",
      price: billingFrequency === "annual" ? "$6 / month (Annual)" : "$8 / month",
      icon: <Sparkles className="h-4 w-4 text-primary" />,
      badge: "Most Popular",
    },
    pro: {
      name: "Pro Plan",
      price: billingFrequency === "annual" ? "$16 / month (Annual)" : "$20 / month",
      icon: <Zap className="h-4 w-4 text-amber-500" />,
      badge: "Power Users",
    },
  }[selectedPlan.toLowerCase() as "free" | "plus" | "pro"] || {
    name: "Free Plan",
    price: "$0 / forever",
    icon: <Layers className="h-4 w-4 text-muted-foreground" />,
    badge: "Standard",
  };

  const signupMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: (response) => {
      if (response.error) {
        const authError = parseAuthError(response.error.message);

        if (authError.field) {
          setError(
            authError.field as
              | "email"
              | "password"
              | "name"
              | "confirmPassword",
            {
              message: authError.message,
            }
          );
        }

        if (shouldShowToast(authError)) {
          toast.error(authError.message);
        }
      } else {
        const planName = planDetails.name;
        toast.success(`Account created with ${planName}! Welcome to Docify!`);
        reset();
        setTimeout(() => {
          router.push("/documents");
        }, 1000);
      }
    },
    onError: (error) => {
      const authError = parseAuthError(error);
      toast.error(authError.message);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    clearErrors();
    signupMutation.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
    });
  }

  return (
    <form
      className={cn("flex flex-col gap-4", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to get started with Docify
          </p>
        </div>

        {/* Selected Plan Banner */}
        <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-background border shadow-2xs">
              {planDetails.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-foreground truncate">
                  {planDetails.name}
                </span>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                  {planDetails.badge}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {planDetails.price}
              </p>
            </div>
          </div>

          <Link
            href="/#pricing"
            className="text-[11px] font-medium text-primary hover:underline shrink-0"
          >
            Change
          </Link>
        </div>

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            required
            {...register("name")}
          />
          <FieldError>{errors.name?.message}</FieldError>
        </Field>

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
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            {...register("password")}
          />
          <FieldDescription>
            Must be at least 8 characters with uppercase, lowercase, and
            number.
          </FieldDescription>
          <FieldError>{errors.password?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            required
            {...register("confirmPassword")}
          />
          <FieldError>{errors.confirmPassword?.message}</FieldError>
        </Field>

        <Field>
          <Button
            type="submit"
            className="cursor-pointer w-full"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
            {signupMutation.isPending
              ? "Creating Account..."
              : `Create Account (${planDetails.name})`}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            disabled={signupMutation.isPending}
          >
            <img src="/googleIcon.svg" alt="Google logo" />
            Sign up with Google
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Login
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
