"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BillingActionsProps {
  mode: "checkout" | "portal";
  plan?: "STARTER" | "PRO" | "AGENCY";
  hasSubscription?: boolean;
}

export function BillingActions({ mode, plan, hasSubscription }: BillingActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!plan) return;
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error(data.error || "Failed to open checkout");
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error(data.error || "Failed to open billing portal");
      setLoading(false);
    }
  }

  if (mode === "portal") {
    return (
      <Button variant="outline" onClick={handlePortal} disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Manage Billing
      </Button>
    );
  }

  return (
    <Button className="w-full" onClick={handleCheckout} disabled={loading}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      Upgrade to {plan}
    </Button>
  );
}
