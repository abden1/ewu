import { NextResponse } from "next/server";
import { validateCronRequest, cronUnauthorized } from "@/lib/cron-auth";
import prisma from "@/lib/prisma";
import { checkEmailBlacklists } from "@/lib/blacklist/checker";
import { extractDomain } from "@/lib/utils";
import { sendBlacklistAlert } from "@/lib/resend";

export async function POST(request: Request) {
  if (!validateCronRequest(request)) return cronUnauthorized();

  const accounts = await prisma.emailAccount.findMany({
    where: { status: "CONNECTED" },
    include: { user: true },
  });

  let checked = 0;
  const errors: string[] = [];

  for (const account of accounts) {
    try {
      const { ip, isListed, listedOn } = await checkEmailBlacklists(account.email);
      const domain = extractDomain(account.email);

      const statusObj: Record<string, boolean> = {};
      listedOn.forEach((bl) => { statusObj[bl] = true; });

      // Was previously blacklisted?
      const previousRecord = await prisma.domainRecord.findUnique({
        where: { emailAccountId: account.id },
      });
      const wasBlacklisted = previousRecord?.isBlacklisted || false;

      await prisma.domainRecord.upsert({
        where: { emailAccountId: account.id },
        create: {
          emailAccountId: account.id,
          domain,
          blacklistStatus: statusObj,
          isBlacklisted: isListed,
          blacklistedOn: listedOn,
          lastCheckedAt: new Date(),
        },
        update: {
          blacklistStatus: statusObj,
          isBlacklisted: isListed,
          blacklistedOn: listedOn,
          lastCheckedAt: new Date(),
        },
      });

      // Newly blacklisted - send alert
      if (isListed && !wasBlacklisted) {
        await prisma.notification.create({
          data: {
            userId: account.userId,
            type: "BLACKLIST_ADDED",
            title: "Domain blacklisted!",
            body: `${domain} is on: ${listedOn.join(", ")}. Campaigns paused.`,
            metadata: { accountId: account.id, domain, blacklists: listedOn },
          },
        });

        // Pause active campaigns
        await prisma.warmupCampaign.updateMany({
          where: { emailAccountId: account.id, status: "ACTIVE" },
          data: { status: "PAUSED" },
        });

        await sendBlacklistAlert(
          account.user.email,
          account.user.name || account.user.email,
          domain,
          listedOn
        ).catch(() => {});
      }

      // Removed from blacklist
      if (!isListed && wasBlacklisted) {
        await prisma.notification.create({
          data: {
            userId: account.userId,
            type: "BLACKLIST_REMOVED",
            title: "Domain removed from blacklist",
            body: `${domain} is no longer on any blacklists.`,
            metadata: { accountId: account.id, domain },
          },
        });
      }

      checked++;
    } catch (err) {
      errors.push(`${account.email}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ checked, errors });
}
