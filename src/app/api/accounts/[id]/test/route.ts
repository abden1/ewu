import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { decryptSmtpConfig, decryptImapConfig } from "@/lib/encryption";
import { testSmtpConnection } from "@/lib/email/smtp";
import { testImapConnection } from "@/lib/email/imap";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const account = await prisma.emailAccount.findFirst({ where: { id, userId: user.id } });
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const smtpConfig = decryptSmtpConfig(account.smtpConfigEncrypted);
  const imapConfig = decryptImapConfig(account.imapConfigEncrypted);

  const [smtpResult, imapResult] = await Promise.all([
    testSmtpConnection(smtpConfig),
    testImapConnection(imapConfig),
  ]);

  const success = smtpResult.success && imapResult.success;

  await prisma.emailAccount.update({
    where: { id },
    data: {
      status: success ? "CONNECTED" : "ERROR",
      lastTestedAt: new Date(),
      lastSmtpError: smtpResult.error || null,
      lastImapError: imapResult.error || null,
    },
  });

  return NextResponse.json({
    success,
    smtp: smtpResult,
    imap: imapResult,
  });
}
