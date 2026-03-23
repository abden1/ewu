import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const account = await prisma.emailAccount.findFirst({
    where: { id, userId: user.id },
    include: {
      campaigns: { orderBy: { createdAt: "desc" } },
      domainRecord: true,
      reputationHistory: { orderBy: { recordedAt: "desc" }, take: 30 },
    },
  });

  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { smtpConfigEncrypted, imapConfigEncrypted, ...safe } = account;
  return NextResponse.json({ account: safe });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const account = await prisma.emailAccount.findFirst({ where: { id, userId: user.id } });
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const updated = await prisma.emailAccount.update({
    where: { id },
    data: {
      displayName: body.displayName,
      isInPool: body.isInPool,
    },
  });

  const { smtpConfigEncrypted, imapConfigEncrypted, ...safe } = updated;
  return NextResponse.json({ account: safe });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const account = await prisma.emailAccount.findFirst({ where: { id, userId: user.id } });
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.emailAccount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
