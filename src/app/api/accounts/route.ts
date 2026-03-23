import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { encryptSmtpConfig, encryptImapConfig } from "@/lib/encryption";
import { detectProvider } from "@/lib/email/provider-presets";
import { z } from "zod";

const CreateAccountSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional(),
  smtp: z.object({
    host: z.string().min(1),
    port: z.number().int().min(1).max(65535),
    secure: z.boolean(),
    user: z.string().min(1),
    password: z.string().min(1),
  }),
  imap: z.object({
    host: z.string().min(1),
    port: z.number().int().min(1).max(65535),
    secure: z.boolean(),
    user: z.string().min(1),
    password: z.string().min(1),
  }),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await prisma.emailAccount.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      campaigns: { select: { id: true, status: true }, take: 1, orderBy: { createdAt: "desc" } },
      domainRecord: { select: { spfValid: true, dkimValid: true, dmarcValid: true, isBlacklisted: true } },
    },
  });

  // Strip encrypted configs from response
  const safe = accounts.map(({ smtpConfigEncrypted, imapConfigEncrypted, ...account }) => account);
  return NextResponse.json({ accounts: safe });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check subscription limit
  const [subscription, existingCount] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.emailAccount.count({ where: { userId: user.id } }),
  ]);

  if (subscription) {
    const isActive = ["TRIALING", "ACTIVE"].includes(subscription.status);
    if (!isActive) {
      return NextResponse.json({ error: "Subscription expired. Please upgrade." }, { status: 402 });
    }
    if (existingCount >= subscription.maxAccounts) {
      return NextResponse.json({ error: `Account limit reached (${subscription.maxAccounts}). Upgrade to add more.` }, { status: 402 });
    }
  }

  const body = await request.json();
  const parsed = CreateAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
  }

  const { email, displayName, smtp, imap } = parsed.data;

  // Check duplicate
  const existing = await prisma.emailAccount.findUnique({ where: { userId_email: { userId: user.id, email } } });
  if (existing) {
    return NextResponse.json({ error: "This email account is already connected." }, { status: 409 });
  }

  const provider = detectProvider(email) as "GMAIL" | "OUTLOOK" | "YAHOO" | "ZOHO" | "CUSTOM";

  const account = await prisma.emailAccount.create({
    data: {
      userId: user.id,
      email,
      displayName: displayName || email.split("@")[0],
      provider,
      smtpConfigEncrypted: encryptSmtpConfig(smtp),
      imapConfigEncrypted: encryptImapConfig(imap),
      status: "PENDING",
      isInPool: true,
    },
  });

  const { smtpConfigEncrypted, imapConfigEncrypted, ...safe } = account;
  return NextResponse.json({ account: safe }, { status: 201 });
}
