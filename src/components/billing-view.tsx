"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Download,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Loader2,
  Receipt,
  Layers,
  Bot,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { User } from "better-auth";
import { cn } from "@/lib/utils";

interface BillingViewProps {
  user?: User | null;
}

type PlanType = "free" | "plus" | "pro";

interface PlanTier {
  id: PlanType;
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

export function BillingView({ user }: BillingViewProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free");
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<PlanTier | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
      ctaText: "Current Plan",
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
      ctaText: "Upgrade to Plus",
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
      ctaText: "Upgrade to Pro",
    },
  ];

  const mockInvoices = [
    {
      id: "INV-2026-003",
      date: "Aug 15, 2026",
      plan: currentPlan === "pro" ? "Docify Pro" : currentPlan === "plus" ? "Docify Plus" : "Docify Free",
      amount: currentPlan === "pro" ? "$192.00" : currentPlan === "plus" ? "$72.00" : "$0.00",
      status: "Paid",
    },
    {
      id: "INV-2026-002",
      date: "Jul 15, 2026",
      plan: "Docify Free",
      amount: "$0.00",
      status: "Paid",
    },
    {
      id: "INV-2026-001",
      date: "Jun 15, 2026",
      plan: "Docify Free",
      amount: "$0.00",
      status: "Paid",
    },
  ];

  const faqs = [
    {
      q: "Can I switch or cancel my plan at any time?",
      a: "Yes! You can upgrade, downgrade, or cancel your subscription at any time. When upgrading or downgrading, your billing will be prorated automatically.",
    },
    {
      q: "How does the AI Assistant prompt limit work?",
      a: "Daily limits reset at midnight UTC every day. Free plans receive 10 Gemini prompts/day, Plus plans receive 100 prompts/day, and Pro plans have completely unlimited queries.",
    },
    {
      q: "What happens to my documents if I downgrade?",
      a: "All of your documents and content remain safe and accessible. You will never lose access to your existing documents or folders upon downgrading.",
    },
    {
      q: "Is there a free trial for Plus or Pro?",
      a: "Yes, all paid plans include a 14-day risk-free trial so you can experience high-speed AI writing and full team collaboration before being billed.",
    },
  ];

  const handlePlanAction = (plan: PlanTier) => {
    if (plan.id === currentPlan) {
      toast.info(`You are currently on the ${plan.name} plan.`);
      return;
    }
    setSelectedPlanForModal(plan);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedPlanForModal) return;
    setIsUpgrading(true);

    setTimeout(() => {
      setCurrentPlan(selectedPlanForModal.id);
      setIsUpgrading(false);
      const planName = selectedPlanForModal.name;
      setSelectedPlanForModal(null);
      toast.success(`Successfully switched to Docify ${planName} Plan! (Mock-up)`, {
        description: `Your account has been updated with ${planName} features.`,
      });
    }, 1000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 py-6 px-4 md:px-6">
      {/* Header & Subtitle */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="secondary" className="px-3 py-1 text-xs font-medium gap-1.5 rounded-full">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Flexible Pricing For Everyone
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Choose the plan that fits your writing
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Unlock high-speed Gemini AI assistance, unlimited folders, team collaboration, and export capabilities.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="flex items-center justify-center gap-3 pt-4 select-none">
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
            <Badge variant="default" className="text-[10px] h-5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
              Save 25%
            </Badge>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col justify-between rounded-2xl transition-all duration-200",
                plan.popular
                  ? "border-primary shadow-lg ring-2 ring-primary/20 bg-card"
                  : "border-border/80 bg-card/60 hover:border-primary/40 hover:shadow-md",
                isCurrent && "ring-2 ring-emerald-500/30 border-emerald-500/50"
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-muted">{plan.icon}</div>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  </div>
                  {isCurrent && (
                    <Badge variant="outline" className="text-[11px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs pt-2 min-h-[36px] text-muted-foreground leading-relaxed">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 flex-1">
                {/* Price Display */}
                <div className="flex items-baseline gap-1 border-b border-border/50 pb-5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                    ${price}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {price === 0 ? "forever" : isAnnual ? "/month, billed yearly" : "/month"}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Included Features:
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-tight text-foreground/90">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="pt-2 pb-6">
                <Button
                  onClick={() => handlePlanAction(plan)}
                  variant={isCurrent ? "outline" : plan.popular ? "default" : "secondary"}
                  className={cn(
                    "w-full h-10 text-xs font-semibold rounded-xl cursor-pointer transition-all",
                    plan.popular && !isCurrent && "shadow-md hover:shadow-primary/20",
                    isCurrent && "cursor-default opacity-80"
                  )}
                  disabled={isCurrent}
                >
                  {isCurrent ? "Current Active Plan" : plan.ctaText}
                  {!isCurrent && <ArrowRight className="h-3.5 w-3.5 ml-1.5" />}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Current Usage Overview Mockup */}
      <Card className="rounded-2xl border-border/80 bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Current Plan & Resource Usage</h3>
            <p className="text-xs text-muted-foreground">
              Account: <span className="font-medium text-foreground">{user?.email || "user@example.com"}</span> (
              {currentPlan.toUpperCase()} Plan)
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5 text-xs py-1 px-2.5 border-primary/30 text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Mock-up Mode Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5">
          {/* AI Queries Meter */}
          <div className="space-y-2 p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-primary" /> AI Queries Today
              </span>
              <span className="text-muted-foreground font-semibold">
                {currentPlan === "free" ? "4 / 10" : currentPlan === "plus" ? "18 / 100" : "42 / Unlimited"}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: currentPlan === "free" ? "40%" : currentPlan === "plus" ? "18%" : "20%",
                }}
              />
            </div>
          </div>

          {/* Folders Meter */}
          <div className="space-y-2 p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-500" /> Folders Created
              </span>
              <span className="text-muted-foreground font-semibold">
                {currentPlan === "free" ? "2 / 5" : "Unlimited"}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: currentPlan === "free" ? "40%" : "10%" }}
              />
            </div>
          </div>

          {/* Collaborators Meter */}
          <div className="space-y-2 p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-emerald-500" /> Shared Collaborators
              </span>
              <span className="text-muted-foreground font-semibold">
                {currentPlan === "free" ? "1 / 3" : "Unlimited"}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: currentPlan === "free" ? "33%" : "8%" }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Simulated Billing History / Invoices */}
      <Card className="rounded-2xl border-border/80 bg-card p-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-base font-bold text-foreground">Billing History & Invoices</h3>
          </div>
          <span className="text-xs text-muted-foreground">Simulated records</span>
        </div>

        <div className="divide-y divide-border/40 overflow-x-auto">
          {mockInvoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-3 text-xs gap-4 min-w-[400px]">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">{inv.plan}</div>
                  <div className="text-[11px] text-muted-foreground">{inv.date} • {inv.id}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-foreground">{inv.amount}</span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  {inv.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.success(`Downloaded simulated receipt ${inv.id}`)}
                  className="h-7 px-2 text-xs gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-3 w-3" />
                  <span>Receipt</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* FAQs Section */}
      <div className="space-y-4 max-w-3xl mx-auto pt-4">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold flex items-center justify-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" /> Frequently Asked Questions
          </h3>
          <p className="text-xs text-muted-foreground">
            Have questions about billing, plans, or features? Here are common answers.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-border/80 rounded-xl bg-card overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-medium text-foreground cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      {selectedPlanForModal && (
        <Dialog
          open={Boolean(selectedPlanForModal)}
          onOpenChange={(open) => !open && setSelectedPlanForModal(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Switch to Docify {selectedPlanForModal.name}
              </DialogTitle>
              <DialogDescription>
                Simulated checkout — no payment card will be charged.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="p-3.5 rounded-xl bg-muted/50 border space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">Plan</span>
                  <span className="font-bold text-primary">Docify {selectedPlanForModal.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Billing Frequency</span>
                  <span>{isAnnual ? "Annual (Save 25%)" : "Monthly"}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold pt-2 border-t text-foreground">
                  <span>Due Today (Mock)</span>
                  <span>
                    $
                    {isAnnual
                      ? selectedPlanForModal.annualPrice * 12
                      : selectedPlanForModal.monthlyPrice}
                    .00
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Clicking confirm will simulate an instant plan upgrade and update your account tier immediately.
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedPlanForModal(null)}
                disabled={isUpgrading}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmUpgrade} disabled={isUpgrading} className="gap-1.5">
                {isUpgrading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Plan Switch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
