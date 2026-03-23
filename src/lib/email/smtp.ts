import nodemailer from "nodemailer";
import type { SmtpConfig } from "@/lib/encryption";

interface SendOptions {
  from: string;
  fromName: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  inReplyTo?: string;
  references?: string;
  trackingPixelUrl?: string;
}

interface SendResult {
  messageId: string;
}

export async function sendEmail(
  config: SmtpConfig,
  options: SendOptions,
  retries = 2
): Promise<SendResult> {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
  });

  const htmlWithPixel = options.trackingPixelUrl
    ? options.html + `<img src="${options.trackingPixelUrl}" width="1" height="1" style="display:none" alt="" />`
    : options.html;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: `"${options.fromName}" <${options.from}>`,
        to: options.to,
        subject: options.subject,
        html: htmlWithPixel,
        text: options.text,
        inReplyTo: options.inReplyTo,
        references: options.references,
        headers: { "X-EWU-Warmup": "1" },
      });

      transporter.close();
      return { messageId: info.messageId };
    } catch (err) {
      if (attempt === retries) {
        transporter.close();
        throw err;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  throw new Error("Failed to send email after retries");
}

export async function testSmtpConnection(config: SmtpConfig): Promise<{ success: boolean; error?: string }> {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });

  try {
    await transporter.verify();
    transporter.close();
    return { success: true };
  } catch (err) {
    transporter.close();
    return { success: false, error: (err as Error).message };
  }
}
