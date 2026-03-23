import { NextResponse } from "next/server";
import { validateCronRequest, cronUnauthorized } from "@/lib/cron-auth";
import prisma from "@/lib/prisma";
import { decryptImapConfig } from "@/lib/encryption";
import { checkInboxPlacement, findWarmupEmails } from "@/lib/email/imap";
import { subDays } from "date-fns";
import { sendSpamAlert } from "@/lib/resend";

export async function POST(request: Request) {
  if (!validateCronRequest(request)) return cronUnauthorized();

  const accounts = await prisma.emailAccount.findMany({
    where: { status: "CONNECTED", isInPool: true },
    include: { user: true },
  });

  let checked = 0;
  const errors: string[] = [];

  for (const account of accounts) {
    try {
      const imapConfig = decryptImapConfig(account.imapConfigEncrypted);
      const sinceDate = subDays(new Date(), 7);

      // Check inbox vs spam placement
      const result = await checkInboxPlacement(imapConfig);

      // Find warm-up emails and update their placement
      const warmupEmails = await findWarmupEmails(imapConfig, sinceDate);
      for (const email of warmupEmails) {
        if (email.messageId) {
          await prisma.emailLog.updateMany({
            where: { messageId: email.messageId },
            data: { placement: email.folder === "INBOX" ? "INBOX" : "SPAM" },
          });
        }
      }

      // Update campaign stats
      const activeCampaign = await prisma.warmupCampaign.findFirst({
        where: { emailAccountId: account.id, status: "ACTIVE" },
      });

      if (activeCampaign) {
        const inboxLogs = await prisma.emailLog.count({
          where: { campaignId: activeCampaign.id, direction: "OUTBOUND", placement: "INBOX" },
        });
        const spamLogs = await prisma.emailLog.count({
          where: { campaignId: activeCampaign.id, direction: "OUTBOUND", placement: "SPAM" },
        });

        await prisma.warmupCampaign.update({
          where: { id: activeCampaign.id },
          data: { inboxCount: inboxLogs, spamCount: spamLogs },
        });

        // Alert if spam rate > 30%
        const total = inboxLogs + spamLogs;
        const spamRate = total > 0 ? spamLogs / total : 0;
        if (spamRate > 0.3 && total > 5) {
          await prisma.notification.create({
            data: {
              userId: account.userId,
              type: "SPAM_DETECTED",
              title: "High spam rate detected",
              body: `${Math.round(spamRate * 100)}% of warm-up emails from ${account.email} are landing in spam.`,
              metadata: { accountId: account.id },
            },
          });

          await sendSpamAlert(
            account.user.email,
            account.user.name || account.user.email,
            account.email,
            spamRate
          ).catch(() => {});
        }
      }

      checked++;
    } catch (err) {
      errors.push(`${account.email}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ checked, errors });
}
