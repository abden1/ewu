import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const CreateCampaignSchema = z.object({
  emailAccountId: z.string(),
  name: z.string().min(1).max(100),
  speed: z.enum(["SLOW", "MEDIUM", "FAST"]).default("MEDIUM"),
  scheduleConfig: z.object({
    timezone: z.string().default("UTC"),
    businessHoursOnly: z.boolean().default(true),
    startHour: z.number().min(0).max(23).default(8),
    endHour: z.number().min(0).max(23).default(18),
  }).optional(),
  templateCategories: z.array(z.string()).default(["business"]),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.warmupCampaign.findMany({
    where: { userId: user.id },
    include: { emailAccount: { select: { email: true, provider: true, reputationScore: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = CreateCampaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
  }

  const { emailAccountId, name, speed, scheduleConfig, templateCategories } = parsed.data;

  // Verify account belongs to user
  const account = await prisma.emailAccount.findFirst({ where: { id: emailAccountId, userId: user.id } });
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  if (account.status !== "CONNECTED") {
    return NextResponse.json({ error: "Account must be connected before starting a campaign" }, { status: 400 });
  }

  // Check for existing active campaign on this account
  const existing = await prisma.warmupCampaign.findFirst({
    where: { emailAccountId, status: { in: ["ACTIVE", "PENDING"] } },
  });
  if (existing) {
    return NextResponse.json({ error: "This account already has an active campaign" }, { status: 409 });
  }

  const campaign = await prisma.warmupCampaign.create({
    data: {
      userId: user.id,
      emailAccountId,
      name,
      speed,
      scheduleConfig: scheduleConfig || { timezone: "UTC", businessHoursOnly: true, startHour: 8, endHour: 18 },
      templateCategories,
      status: "PENDING",
    },
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
