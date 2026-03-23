import { promises as dns } from "dns";

const BLACKLISTS = [
  { name: "Spamhaus ZEN", zone: "zen.spamhaus.org" },
  { name: "SpamCop", zone: "bl.spamcop.net" },
  { name: "Barracuda", zone: "b.barracudacentral.org" },
  { name: "SORBS", zone: "dnsbl.sorbs.net" },
];

async function resolveARecord(hostname: string): Promise<boolean> {
  try {
    await dns.resolve4(hostname);
    return true; // Listed
  } catch {
    return false; // Not listed
  }
}

function reverseIp(ip: string): string {
  return ip.split(".").reverse().join(".");
}

export interface BlacklistResult {
  blacklist: string;
  listed: boolean;
}

export async function checkIpBlacklists(ip: string): Promise<BlacklistResult[]> {
  const reversedIp = reverseIp(ip);
  const results = await Promise.all(
    BLACKLISTS.map(async (bl) => ({
      blacklist: bl.name,
      listed: await resolveARecord(`${reversedIp}.${bl.zone}`),
    }))
  );
  return results;
}

export async function resolveEmailIp(email: string): Promise<string | null> {
  try {
    const domain = email.split("@")[1];
    const records = await dns.resolveMx(domain);
    if (records.length === 0) return null;

    const mxHost = records.sort((a, b) => a.priority - b.priority)[0].exchange;
    const addresses = await dns.resolve4(mxHost);
    return addresses[0] || null;
  } catch {
    return null;
  }
}

export async function checkEmailBlacklists(email: string): Promise<{
  ip: string | null;
  results: BlacklistResult[];
  isListed: boolean;
  listedOn: string[];
}> {
  const ip = await resolveEmailIp(email);
  if (!ip) {
    return { ip: null, results: [], isListed: false, listedOn: [] };
  }

  const results = await checkIpBlacklists(ip);
  const listedOn = results.filter((r) => r.listed).map((r) => r.blacklist);

  return {
    ip,
    results,
    isListed: listedOn.length > 0,
    listedOn,
  };
}
