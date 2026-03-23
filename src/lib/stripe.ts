import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export const PLANS = {
  STARTER: {
    priceId: process.env.STRIPE_PRICE_STARTER!,
    maxAccounts: 1,
    name: "Starter",
    price: 20,
    description: "Perfect for individual senders",
  },
  PRO: {
    priceId: process.env.STRIPE_PRICE_PRO!,
    maxAccounts: 5,
    name: "Pro",
    price: 50,
    description: "For growing teams",
  },
  AGENCY: {
    priceId: process.env.STRIPE_PRICE_AGENCY!,
    maxAccounts: 50,
    name: "Agency",
    price: 200,
    description: "For agencies and large teams",
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return key as PlanKey;
  }
  return null;
}

export function getMaxAccountsForPlan(plan: string): number {
  if (plan in PLANS) return PLANS[plan as PlanKey].maxAccounts;
  return 1;
}

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  userEmail: string,
  customerId?: string
): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=true`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
    allow_promotion_codes: true,
    billing_address_collection: "required",
  };

  if (customerId) {
    sessionParams.customer = customerId;
  } else {
    sessionParams.customer_email = userEmail;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return session.url!;
}

export async function createPortalSession(
  customerId: string
): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard/billing`,
  });
  return session.url;
}
