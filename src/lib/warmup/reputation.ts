import prisma from "@/lib/prisma";

export async function calculateReputation(emailAccountId: string): Promise<number> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get email logs from last 7 days
  const logs = await prisma.emailLog.findMany({
    where: {
      emailAccountId,
      createdAt: { gte: sevenDaysAgo },
    },
  });

  const outbound = logs.filter((l) => l.direction === "OUTBOUND");
  const totalSent = outbound.length;

  if (totalSent === 0) {
    return 50; // default score
  }

  const inboxCount = outbound.filter((l) => l.placement === "INBOX").length;
  const spamCount = outbound.filter((l) => l.placement === "SPAM").length;
  const openedCount = outbound.filter((l) => l.openedAt !== null).length;
  const knownPlacement = inboxCount + spamCount;

  const inboxPlacementRate = knownPlacement > 0 ? inboxCount / knownPlacement : 0.5;
  const openRate = totalSent > 0 ? Math.min(openedCount / totalSent, 1) : 0;
  const bounceRate = 0; // simplified - would need SMTP bounce tracking
  const bounceRateInverse = 1 - bounceRate;

  // Get domain auth score
  const domainRecord = await prisma.domainRecord.findUnique({
    where: { emailAccountId },
  });

  const authComponents = domainRecord
    ? [domainRecord.spfValid, domainRecord.dkimValid, domainRecord.dmarcValid].filter(Boolean).length
    : 0;
  const authScore = authComponents / 3;

  // Weighted formula: inbox 40% + open 20% + bounce 20% + auth 20%
  const score = Math.round(
    inboxPlacementRate * 40 +
    openRate * 20 +
    bounceRateInverse * 20 +
    authScore * 20
  );

  return Math.max(0, Math.min(100, score));
}

export async function saveReputationSnapshot(
  emailAccountId: string,
  score: number
): Promise<void> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const logs = await prisma.emailLog.findMany({
    where: { emailAccountId, createdAt: { gte: sevenDaysAgo }, direction: "OUTBOUND" },
  });

  const totalSent = logs.length;
  const inboxCount = logs.filter((l) => l.placement === "INBOX").length;
  const spamCount = logs.filter((l) => l.placement === "SPAM").length;
  const openedCount = logs.filter((l) => l.openedAt !== null).length;
  const knownPlacement = inboxCount + spamCount;

  const domainRecord = await prisma.domainRecord.findUnique({ where: { emailAccountId } });
  const authComponents = domainRecord
    ? [domainRecord.spfValid, domainRecord.dkimValid, domainRecord.dmarcValid].filter(Boolean).length
    : 0;

  await prisma.reputationSnapshot.create({
    data: {
      emailAccountId,
      score,
      inboxPlacementRate: knownPlacement > 0 ? inboxCount / knownPlacement : 0.5,
      openRate: totalSent > 0 ? openedCount / totalSent : 0,
      bounceRate: 0,
      spamRate: knownPlacement > 0 ? spamCount / knownPlacement : 0,
      authScore: authComponents / 3,
    },
  });

  await prisma.emailAccount.update({
    where: { id: emailAccountId },
    data: { reputationScore: score },
  });
}
