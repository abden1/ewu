import prisma from "@/lib/prisma";
import { decryptImapConfig, decryptSmtpConfig } from "@/lib/encryption";

interface PoolPair {
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderSmtpConfig: ReturnType<typeof decryptSmtpConfig>;
  recipientId: string;
  recipientEmail: string;
  recipientName: string;
  campaignId: string;
}

export async function getPoolPairs(
  senderId: string,
  senderUserId: string,
  sendsNeeded: number
): Promise<PoolPair[]> {
  const sender = await prisma.emailAccount.findUnique({
    where: { id: senderId },
    include: { campaigns: { where: { status: "ACTIVE" }, take: 1 } },
  });

  if (!sender || sender.campaigns.length === 0) return [];

  const campaign = sender.campaigns[0];

  // Get candidate recipients from pool (different user, different domain if possible)
  const senderDomain = sender.email.split("@")[1];

  const candidates = await prisma.emailAccount.findMany({
    where: {
      isInPool: true,
      status: "CONNECTED",
      reputationScore: { gte: 20 },
      userId: { not: senderUserId },
      id: { not: senderId },
    },
    include: { campaigns: { where: { status: "ACTIVE" }, take: 1 } },
    take: sendsNeeded * 3,
  });

  const pairs: PoolPair[] = [];

  // Shuffle candidates
  const shuffled = candidates.sort(() => Math.random() - 0.5);

  for (const candidate of shuffled) {
    if (pairs.length >= sendsNeeded) break;
    if (candidate.campaigns.length === 0) continue;

    const senderSmtpConfig = decryptSmtpConfig(sender.smtpConfigEncrypted);

    pairs.push({
      senderId: sender.id,
      senderEmail: sender.email,
      senderName: sender.displayName || sender.email.split("@")[0],
      senderSmtpConfig,
      recipientId: candidate.id,
      recipientEmail: candidate.email,
      recipientName: candidate.displayName || candidate.email.split("@")[0],
      campaignId: campaign.id,
    });
  }

  return pairs;
}
