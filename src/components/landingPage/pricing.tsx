"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Check,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanTier {
  id: "free" | "plus" | "pro";
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  icon: React.ReactNode;
  features: string[];
  ctaText: string;
}

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans: PlanTier[] = [
    {
      id: "free",
      name: "Free",
      description: "Everything you need to write, organize, and share your personal documents.",
      monthlyPrice: 0,
      annualPrice: 0,
      icon: <Layers className="h-5 w-5 text-muted-foreground" />,
      features: [
        "Unlimited Documents",
        "Up to 5 Folders & Color tags",
        "3 Collaborators per document",
        "Standard Export (PDF, TXT, HTML)",
        "10 AI Assistant queries / day",
        "Community Support",
      ],
      ctaText: "Get Started Free",
    },
    {
      id: "plus",
      name: "Plus",
      badge: "Most Popular",
      popular: true,
      description: "Supercharged with high-volume AI writing, unlimited organization & markdown.",
      monthlyPrice: 8,
      annualPrice: 6,
      icon: <Sparkles className="h-5 w-5 text-primary" />,
      features: [
        "Everything in Free, plus:",
        "Unlimited Folders & Custom Tags",
        "100 AI Gemini queries / day",
        "Unlimited Collaborators with Roles",
        "Full Export suite (Markdown, Clean PDF)",
        "Document Version History (30 days)",
        "Priority AI Generation Speed",
      ],
      ctaText: "Start with Plus",
    },
    {
      id: "pro",
      name: "Pro",
      badge: "Power Users",
      description: "For professionals and teams requiring unlimited AI power and advanced collaboration.",
      monthlyPrice: 20,
      annualPrice: 16,
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      features: [
        "Everything in Plus, plus:",
        "Unlimited AI Assistant (No daily cap)",
        "Team Shared Workspaces",
        "Unlimited Version History & Restore",
        "Custom Document Branding",
        "Priority 24/7 Support",
        "Early Access to Beta Features",
      ],
      ctaText: "Start with Pro",
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-muted/20 border-y border-border/50" id="pricing">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-3">
            <Sparkles className="h-4 w-4" />
            Pricing Plans
          </div>
          <h2 className="font-sans font-bold text-4xl sm:text-5xl text-balance mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
            Start free, then upgrade to unlock powerful Gemini AI assistance and unlimited team collaboration.
          </p>

          {/* Billing Switcher */}
          <div className="flex items-center justify-center gap-3 pt-6 select-none">
            <span
              onClick={() => setIsAnnual(false)}
              className={cn(
                "text-xs sm:text-sm font-medium cursor-pointer transition-colors",
                !isAnnual ? "text-foreground font-semibold" : "text-muted-foreground"
              )}
            >
              Monthly Billing
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              aria-label="Toggle annual billing"
            />
            <span
              onClick={() => setIsAnnual(true)}
              className={cn(
                "text-xs sm:text-sm font-medium cursor-pointer transition-colors flex items-center gap-1.5",
                isAnnual ? "text-foreground font-semibold" : "text-muted-foreground"
              )}
            >
              <span>Annual Billing</span>
              <Badge
                variant="default"
                className="text-[10px] h-5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                Save 25%
              </Badge>
            </span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const signupUrl = `/signup?plan=${plan.id}&billing=${isAnnual ? "annual" : "monthly"}`;

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col justify-between rounded-2xl transition-all duration-300",
                  plan.popular
                    ? "border-primary shadow-xl ring-2 ring-primary/20 bg-card scale-100 md:-translate-y-2"
                    : "border-border bg-card/70 hover:border-primary/40 hover:shadow-lg"
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge
                      className={cn(
                        "px-3 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full shadow-sm",
                        plan.popular
                          ? "bg-primary text-primary-foreground"
                          : "bg-amber-500 text-white"
                      )}
                    >
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pt-6 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-muted">{plan.icon}</div>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="text-xs pt-2 min-h-[36px] text-muted-foreground leading-relaxed">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 flex-1">
                  {/* Price */}
                  <div className="flex items-baseline gap-1 border-b border-border/50 pb-5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                      ${price}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {price === 0
                        ? "forever"
                        : isAnnual
                        ? "/month, billed yearly"
                        : "/month"}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      What&apos;s included:
                    </div>
                    <ul className="space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-muted-foreground"
                        >
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="leading-tight text-foreground/90 font-medium">
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 pb-6">
                  <Button
                    asChild
                    variant={plan.popular ? "default" : "outline"}
                    className={cn(
                      "w-full h-11 text-xs font-semibold rounded-xl cursor-pointer transition-all gap-1.5",
                      plan.popular && "shadow-md hover:shadow-primary/20"
                    )}
                  >
                    <Link href={signupUrl}>
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
