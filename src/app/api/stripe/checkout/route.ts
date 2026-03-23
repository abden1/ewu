import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createCheckoutSession, PLANS } from "@/lib/stripe";
import { z } from "zod";

const Schema = z.object({ plan: z.enum(["STARTER", "PRO", "AGENCY"]) });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const { plan } = parsed.data;
  const priceId = PLANS[plan].priceId;

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });

  const url = await createCheckoutSession(
    user.id,
    priceId,
    user.email!,
    subscription?.stripeCustomerId || undefined
  );

  return NextResponse.json({ url });
}
