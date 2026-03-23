import type { SmtpConfig, ImapConfig } from "@/lib/encryption";

interface ProviderPreset {
  smtp: Omit<SmtpConfig, "user" | "password">;
  imap: Omit<ImapConfig, "user" | "password">;
  oauthSupported: boolean;
}

export const PROVIDER_PRESETS: Record<string, ProviderPreset> = {
  GMAIL: {
    smtp: { host: "smtp.gmail.com", port: 587, secure: false },
    imap: { host: "imap.gmail.com", port: 993, secure: true },
    oauthSupported: true,
  },
  OUTLOOK: {
    smtp: { host: "smtp-mail.outlook.com", port: 587, secure: false },
    imap: { host: "outlook.office365.com", port: 993, secure: true },
    oauthSupported: true,
  },
  YAHOO: {
    smtp: { host: "smtp.mail.yahoo.com", port: 587, secure: false },
    imap: { host: "imap.mail.yahoo.com", port: 993, secure: true },
    oauthSupported: false,
  },
  ZOHO: {
    smtp: { host: "smtp.zoho.com", port: 587, secure: false },
    imap: { host: "imap.zoho.com", port: 993, secure: true },
    oauthSupported: false,
  },
  CUSTOM: {
    smtp: { host: "", port: 587, secure: false },
    imap: { host: "", port: 993, secure: true },
    oauthSupported: false,
  },
};

export function detectProvider(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  if (domain.includes("gmail") || domain.includes("googlemail")) return "GMAIL";
  if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live") || domain.includes("msn")) return "OUTLOOK";
  if (domain.includes("yahoo")) return "YAHOO";
  if (domain.includes("zoho")) return "ZOHO";
  return "CUSTOM";
}

export function getPreset(provider: string): ProviderPreset {
  return PROVIDER_PRESETS[provider] || PROVIDER_PRESETS.CUSTOM;
}
