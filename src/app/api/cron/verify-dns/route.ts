import { NextResponse } from "next/server";
import { validateCronRequest, cronUnauthorized } from "@/lib/cron-auth";
import prisma from "@/lib/prisma";
import { checkAllDns } from "@/lib/dns/verifier";
import { extractDomain } from "@/lib/utils";

export async function POST(request: Request) {
  if (!validateCronRequest(request)) return cronUnauthorized();

  const accounts = await prisma.emailAccount.findMany({
    where: { status: "CONNECTED" },
  });

  let verified = 0;
  const errors: string[] = [];

  for (const account of accounts) {
    try {
      const domain = extractDomain(account.email);
      const { spf, dkim, dmarc } = await checkAllDns(domain);

      await prisma.domainRecord.upsert({
        where: { emailAccountId: account.id },
        create: {
          emailAccountId: account.id,
          domain,
          spfRecord: spf.record,
          spfValid: spf.valid,
          dkimRecord: dkim.record,
          dkimValid: dkim.valid,
          dmarcRecord: dmarc.record,
          dmarcValid: dmarc.valid,
          lastCheckedAt: new Date(),
        },
        update: {
          spfRecord: spf.record,
          spfValid: spf.valid,
          dkimRecord: dkim.record,
          dkimValid: dkim.valid,
          dmarcRecord: dmarc.record,
          dmarcValid: dmarc.valid,
          lastCheckedAt: new Date(),
        },
      });

      verified++;
    } catch (err) {
      errors.push(`${account.email}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ verified, errors });
}
