"use client"

import { Check, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SubscriptionSettings() {
  const currentPlan: string = "pro"

  return (
    <Card id="subscription">
      <CardHeader>
        <CardTitle className="text-foreground">AI Subscription</CardTitle>
        <CardDescription>Manage your AI features and subscription plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Free Plan */}
          <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Free</h3>
                {currentPlan === "free" && <Badge variant="secondary">Current Plan</Badge>}
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-foreground">$0</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Basic AI suggestions</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">5 documents per month</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Community support</span>
                </li>
              </ul>
              {currentPlan !== "free" && (
                <Button variant="outline" className="w-full bg-transparent">
                  Downgrade
                </Button>
              )}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative overflow-hidden rounded-lg border-2 border-primary bg-card p-6">
            <div className="absolute right-4 top-4">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Pro</h3>
                {currentPlan === "pro" && <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>}
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-foreground">$19</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-foreground">Advanced AI writing assistant</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-foreground">Unlimited documents</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-foreground">Real-time collaboration AI</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-foreground">Priority support</span>
                </li>
              </ul>
              {currentPlan === "pro" ? (
                <Button variant="outline" className="w-full bg-transparent">
                  Manage Subscription
                </Button>
              ) : (
                <Button className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </div>
        </div>

        {currentPlan === "pro" && (
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-foreground">Current Billing Cycle</h4>
                <p className="text-sm text-muted-foreground">Your next payment of $19.00 is due on December 15, 2025</p>
              </div>
              <Button variant="ghost" size="sm">
                View Invoice
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">AI Usage This Month</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">AI Suggestions Used</span>
              <span className="font-medium text-foreground">1,247 / Unlimited</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[45%] bg-primary" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
