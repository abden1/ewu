import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.warmupCampaign.findFirst({
    where: { id, userId: user.id },
    include: {
      emailAccount: true,
      emailLogs: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { emailAccount: { smtpConfigEncrypted, imapConfigEncrypted, ...safeAccount }, ...safeCampaign } = campaign as any;
  return NextResponse.json({ campaign: { ...safeCampaign, emailAccount: safeAccount } });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.warmupCampaign.findFirst({ where: { id, userId: user.id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.warmupCampaign.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
