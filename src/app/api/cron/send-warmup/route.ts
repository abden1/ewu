import { NextResponse } from "next/server";
import { validateCronRequest, cronUnauthorized } from "@/lib/cron-auth";
import prisma from "@/lib/prisma";
import { decryptSmtpConfig } from "@/lib/encryption";
import { sendEmail } from "@/lib/email/smtp";
import { getDailyTarget, getTargetForWindow, isWithinSchedule, shouldAdvanceDay } from "@/lib/warmup/algorithm";
import { getRandomTemplate, getRandomSubject } from "@/lib/email/templates";
import { generateTrackingPixelUrl } from "@/lib/utils";
import type { TemplateCategory } from "@/lib/email/templates";

const WINDOW_MINUTES = 30;
const TOTAL_WINDOW_MINUTES = 10 * 60; // 10 hour business window

export async function POST(request: Request) {
  if (!validateCronRequest(request)) return cronUnauthorized();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  let totalSent = 0;
  const errors: string[] = [];

  // Get all active campaigns
  const campaigns = await prisma.warmupCampaign.findMany({
    where: { status: "ACTIVE" },
    include: {
      emailAccount: true,
      user: { include: { subscription: true } },
    },
  });

  for (const campaign of campaigns) {
    try {
      const account = campaign.emailAccount;
      if (account.status !== "CONNECTED") continue;

      // Check subscription
      const sub = campaign.user.subscription;
      if (!sub || !["TRIALING", "ACTIVE"].includes(sub.status)) {
        await prisma.warmupCampaign.update({ where: { id: campaign.id }, data: { status: "PAUSED" } });
        continue;
      }

      // Check schedule
      const schedule = campaign.scheduleConfig as any;
      if (!isWithinSchedule(schedule)) continue;

      // Advance day if needed
      if (campaign.startedAt && shouldAdvanceDay(campaign.startedAt, campaign.currentDay)) {
        const newDay = campaign.currentDay + 1;
        if (newDay > campaign.totalDayTarget) {
          await prisma.warmupCampaign.update({
            where: { id: campaign.id },
            data: { status: "COMPLETED", completedAt: new Date(), currentDay: newDay },
          });
          continue;
        }
        await prisma.warmupCampaign.update({ where: { id: campaign.id }, data: { currentDay: newDay } });
      }

      // How many sends in this window?
      const dailyTarget = getDailyTarget(campaign.currentDay || 1, campaign.speed);
      const windowTarget = getTargetForWindow(dailyTarget, WINDOW_MINUTES, TOTAL_WINDOW_MINUTES);
      if (windowTarget === 0) continue;

      // Count today's sends
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const todaySent = await prisma.emailLog.count({
        where: { campaignId: campaign.id, direction: "OUTBOUND", sentAt: { gte: todayStart } },
      });
      const remaining = Math.max(0, dailyTarget - todaySent);
      const toSend = Math.min(windowTarget, remaining);
      if (toSend === 0) continue;

      // Get pool recipients (different user accounts in pool)
      const recipients = await prisma.emailAccount.findMany({
        where: {
          isInPool: true,
          status: "CONNECTED",
          userId: { not: campaign.userId },
          id: { not: account.id },
          reputationScore: { gte: 20 },
        },
        take: toSend * 2,
      });

      if (recipients.length === 0) continue;

      const smtpConfig = decryptSmtpConfig(account.smtpConfigEncrypted);
      const senderName = account.displayName || account.email.split("@")[0];
      const category = (campaign.templateCategories[0] as TemplateCategory) || "business";

      for (let i = 0; i < Math.min(toSend, recipients.length); i++) {
        const recipient = recipients[i % recipients.length];
        const recipientName = recipient.displayName || recipient.email.split("@")[0];
        const template = getRandomTemplate(category);
        const subject = getRandomSubject(template);
        const vars = { senderName, recipientName };
        const html = template.html(vars);
        const text = template.text(vars);

        try {
          const log = await prisma.emailLog.create({
            data: {
              campaignId: campaign.id,
              emailAccountId: account.id,
              direction: "OUTBOUND",
              fromAddress: account.email,
              toAddress: recipient.email,
              subject,
              placement: "UNKNOWN",
            },
          });

          const trackingUrl = generateTrackingPixelUrl(appUrl, log.id);
          const result = await sendEmail(smtpConfig, {
            from: account.email,
            fromName: senderName,
            to: recipient.email,
            subject,
            html,
            text,
            trackingPixelUrl: trackingUrl,
          });

          await prisma.emailLog.update({
            where: { id: log.id },
            data: { messageId: result.messageId, sentAt: new Date() },
          });

          await prisma.warmupCampaign.update({
            where: { id: campaign.id },
            data: { totalSent: { increment: 1 } },
          });

          totalSent++;
        } catch (err) {
          errors.push(`${account.email}: ${(err as Error).message}`);
        }
      }
    } catch (err) {
      errors.push(`Campaign ${campaign.id}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ processed: campaigns.length, sent: totalSent, errors });
}
