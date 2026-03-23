import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BillingActions } from "@/components/billing/BillingActions";
import { CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    price: 20,
    key: "STARTER",
    accounts: 1,
    features: ["1 email account", "30-day campaigns", "Spam monitoring", "Basic analytics"],
  },
  {
    name: "Pro",
    price: 50,
    key: "PRO",
    accounts: 5,
    features: ["5 email accounts", "All Starter features", "Blacklist monitoring", "DNS verification"],
  },
  {
    name: "Agency",
    price: 200,
    key: "AGENCY",
    accounts: 50,
    features: ["50 email accounts", "All Pro features", "API access", "Priority support"],
  },
];

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [subscription, accountCount] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.emailAccount.count({ where: { userId: user.id } }),
  ]);

  const currentPlan = subscription?.plan || "FREE_TRIAL";
  const maxAccounts = subscription?.maxAccounts || 1;
  const isTrialing = subscription?.status === "TRIALING";
  const daysLeft = subscription?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0;

  const statusVariant = (status: string) => {
    if (status === "ACTIVE") return "success";
    if (status === "TRIALING") return "navy";
    if (status === "PAST_DUE") return "warning";
    if (status === "CANCELED") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black">
                {isTrialing ? "Free Trial" : currentPlan.replace("_", " ")}
              </div>
              {isTrialing && (
                <div className="text-muted-foreground text-sm">
                  {daysLeft} days remaining · Expires {subscription?.trialEndsAt ? formatDate(subscription.trialEndsAt) : "-"}
                </div>
              )}
              {subscription?.currentPeriodEnd && !isTrialing && (
                <div className="text-muted-foreground text-sm">
                  Renews {formatDate(subscription.currentPeriodEnd)}
                </div>
              )}
            </div>
            <Badge variant={statusVariant(subscription?.status || "TRIALING") as any}>
              {subscription?.status?.replace("_", " ").toLowerCase() || "trialing"}
            </Badge>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Email Accounts</span>
              <span className="font-semibold">{accountCount} / {maxAccounts}</span>
            </div>
            <Progress value={(accountCount / maxAccounts) * 100} />
          </div>

          {subscription?.stripeCustomerId && (
            <BillingActions hasSubscription mode="portal" />
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h3 className="text-lg font-bold mb-4">
          {isTrialing || !subscription?.stripeCustomerId ? "Choose a Plan" : "Change Plan"}
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.key;
            return (
              <div
                key={plan.key}
                className={`rounded-xl border p-6 ${
                  isCurrent ? "border-brand-red bg-brand-red/5" : "border-border bg-card"
                }`}
              >
                {isCurrent && (
                  <Badge className="mb-3 bg-brand-red/20 text-brand-red border-brand-red/30">Current Plan</Badge>
                )}
                <div className="text-lg font-bold">{plan.name}</div>
                <div className="text-3xl font-black mt-1 mb-1">${plan.price}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                <div className="text-sm text-muted-foreground mb-4">{plan.accounts} email account{plan.accounts > 1 ? "s" : ""}</div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <BillingActions plan={plan.key as "STARTER" | "PRO" | "AGENCY"} mode="checkout" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
