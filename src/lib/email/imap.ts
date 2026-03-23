import { ImapFlow } from "imapflow";
import type { ImapConfig } from "@/lib/encryption";

interface InboxResult {
  inboxCount: number;
  spamCount: number;
  placementRate: number;
}

interface WarmupEmail {
  messageId: string;
  subject: string;
  from: string;
  folder: "INBOX" | "SPAM";
}

const SPAM_FOLDER_NAMES = ["[Gmail]/Spam", "Junk", "Spam", "Bulk Mail", "Junk E-mail"];

async function getClient(config: ImapConfig): Promise<ImapFlow> {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
    logger: false,
    tls: { rejectUnauthorized: false },
  });

  await client.connect();
  return client;
}

export async function testImapConnection(config: ImapConfig): Promise<{ success: boolean; error?: string }> {
  let client: ImapFlow | null = null;
  try {
    client = await getClient(config);
    await client.logout();
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  } finally {
    if (client && !client.usable) {
      // already logged out
    }
  }
}

export async function checkInboxPlacement(config: ImapConfig): Promise<InboxResult> {
  const client = await getClient(config);

  try {
    // Count inbox messages
    const inboxLock = await client.getMailboxLock("INBOX");
    const inboxStatus = await client.status("INBOX", { messages: true });
    const inboxCount = inboxStatus.messages || 0;
    inboxLock.release();

    // Try to find spam folder
    let spamCount = 0;
    const folders = await client.list();

    for (const folder of folders) {
      const folderName = folder.name || folder.path;
      const isSpam = SPAM_FOLDER_NAMES.some((name) =>
        folderName.toLowerCase().includes(name.toLowerCase().replace(/\[gmail\]\//i, ""))
      );

      if (isSpam) {
        try {
          const spamLock = await client.getMailboxLock(folder.path);
          const spamStatus = await client.status(folder.path, { messages: true });
          spamCount += spamStatus.messages || 0;
          spamLock.release();
        } catch {
          // folder not accessible
        }
        break;
      }
    }

    const total = inboxCount + spamCount;
    const placementRate = total > 0 ? inboxCount / total : 1;

    return { inboxCount, spamCount, placementRate };
  } finally {
    await client.logout();
  }
}

export async function findWarmupEmails(
  config: ImapConfig,
  sinceDate: Date
): Promise<WarmupEmail[]> {
  const client = await getClient(config);
  const results: WarmupEmail[] = [];

  try {
    // Check inbox
    const inboxLock = await client.getMailboxLock("INBOX");
    const inboxMessages = client.fetch(
      { since: sinceDate },
      { envelope: true, headers: ["x-ewu-warmup"] }
    );

    for await (const msg of inboxMessages) {
      if (msg.headers) {
        const headerText = msg.headers.toString();
        if (headerText.includes("X-EWU-Warmup") && msg.envelope) {
          results.push({
            messageId: msg.envelope.messageId || "",
            subject: msg.envelope.subject || "",
            from: msg.envelope.from?.[0]?.address || "",
            folder: "INBOX",
          });
        }
      }
    }
    inboxLock.release();

    // Check spam folders
    const folders = await client.list();
    for (const folder of folders) {
      const isSpam = SPAM_FOLDER_NAMES.some((name) =>
        folder.path.toLowerCase().includes(name.toLowerCase().replace(/\[gmail\]\//i, ""))
      );

      if (isSpam) {
        try {
          const spamLock = await client.getMailboxLock(folder.path);
          const spamMessages = client.fetch(
            { since: sinceDate },
            { envelope: true, headers: ["x-ewu-warmup"] }
          );

          for await (const msg of spamMessages) {
            if (msg.headers) {
              const headerText = msg.headers.toString();
              if (headerText.includes("X-EWU-Warmup") && msg.envelope) {
                results.push({
                  messageId: msg.envelope.messageId || "",
                  subject: msg.envelope.subject || "",
                  from: msg.envelope.from?.[0]?.address || "",
                  folder: "SPAM",
                });
              }
            }
          }
          spamLock.release();
        } catch {
          // skip inaccessible folders
        }
        break;
      }
    }

    return results;
  } finally {
    await client.logout();
  }
}
