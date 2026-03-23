import { NextResponse } from "next/server";
import { validateCronRequest, cronUnauthorized } from "@/lib/cron-auth";
import prisma from "@/lib/prisma";
import { calculateReputation, saveReputationSnapshot } from "@/lib/warmup/reputation";

export async function POST(request: Request) {
  if (!validateCronRequest(request)) return cronUnauthorized();

  const accounts = await prisma.emailAccount.findMany({
    where: { status: "CONNECTED" },
  });

  let updated = 0;
  const errors: string[] = [];

  for (const account of accounts) {
    try {
      const previousScore = account.reputationScore;
      const newScore = await calculateReputation(account.id);
      await saveReputationSnapshot(account.id, newScore);

      // Alert on significant reputation drop (>15 points)
      if (previousScore - newScore > 15) {
        await prisma.notification.create({
          data: {
            userId: account.userId,
            type: "REPUTATION_DROP",
            title: "Reputation score dropped",
            body: `${account.email} reputation dropped from ${previousScore} to ${newScore}.`,
            metadata: { accountId: account.id, previousScore, newScore },
          },
        });
      }

      updated++;
    } catch (err) {
      errors.push(`${account.id}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ updated, errors });
}
