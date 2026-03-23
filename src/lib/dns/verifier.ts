import { promises as dns } from "dns";

export interface DnsCheckResult {
  spf: { valid: boolean; record: string | null };
  dkim: { valid: boolean; record: string | null };
  dmarc: { valid: boolean; record: string | null };
}

async function getTxtRecords(hostname: string): Promise<string[]> {
  try {
    const records = await dns.resolveTxt(hostname);
    return records.map((r) => r.join(""));
  } catch {
    return [];
  }
}

export async function checkSpf(domain: string): Promise<{ valid: boolean; record: string | null }> {
  const records = await getTxtRecords(domain);
  const spfRecord = records.find((r) => r.startsWith("v=spf1"));
  return { valid: !!spfRecord, record: spfRecord || null };
}

export async function checkDkim(domain: string): Promise<{ valid: boolean; record: string | null }> {
  const selectors = ["google", "default", "mail", "dkim", "k1", "s1", "s2"];

  for (const selector of selectors) {
    const hostname = `${selector}._domainkey.${domain}`;
    const records = await getTxtRecords(hostname);
    const dkimRecord = records.find((r) => r.includes("v=DKIM1") || r.includes("k=rsa") || r.includes("p="));
    if (dkimRecord) {
      return { valid: true, record: dkimRecord };
    }
  }

  return { valid: false, record: null };
}

export async function checkDmarc(domain: string): Promise<{ valid: boolean; record: string | null }> {
  const records = await getTxtRecords(`_dmarc.${domain}`);
  const dmarcRecord = records.find((r) => r.startsWith("v=DMARC1"));
  return { valid: !!dmarcRecord, record: dmarcRecord || null };
}

export async function checkAllDns(domain: string): Promise<DnsCheckResult> {
  const [spf, dkim, dmarc] = await Promise.all([
    checkSpf(domain),
    checkDkim(domain),
    checkDmarc(domain),
  ]);

  return { spf, dkim, dmarc };
}
