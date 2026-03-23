import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ewu.app";

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to EWU - Your Email Warm-Up Journey Begins",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#f1f0fb;padding:40px;border-radius:12px">
        <div style="text-align:center;margin-bottom:32px">
          <h1 style="font-size:32px;font-weight:900;margin:0">
            <span style="color:#7e0000">E</span><span style="color:#753100">W</span><sup style="color:#10016c;font-size:18px">U</sup>
          </h1>
          <p style="color:#8b8aa5;margin:8px 0 0">Email Warm-Up</p>
        </div>
        <h2 style="color:#f1f0fb">Welcome, ${name}!</h2>
        <p style="color:#c4c3dd;line-height:1.6">
          Your 7-day free trial has started. Connect your first email account and begin warming up your sender reputation today.
        </p>
        <div style="text-align:center;margin:32px 0">
          <a href="${APP_URL}/dashboard" style="background:linear-gradient(135deg,#10016c,#7e0000);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            Go to Dashboard
          </a>
        </div>
        <p style="color:#8b8aa5;font-size:14px">The EWU Team</p>
      </div>
    `,
  });
}

export async function sendBlacklistAlert(
  email: string,
  name: string,
  domain: string,
  blacklists: string[]
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `[ALERT] ${domain} detected on blacklist`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#f1f0fb;padding:40px;border-radius:12px">
        <h2 style="color:#ef4444">Blacklist Alert</h2>
        <p style="color:#c4c3dd">Hi ${name}, your domain <strong>${domain}</strong> has been detected on the following blacklists:</p>
        <ul style="color:#c4c3dd">
          ${blacklists.map((bl) => `<li>${bl}</li>`).join("")}
        </ul>
        <p style="color:#c4c3dd">Your warm-up campaigns have been paused. Please investigate and delist your domain before resuming.</p>
        <a href="${APP_URL}/dashboard/analytics" style="background:linear-gradient(135deg,#10016c,#7e0000);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
          View Details
        </a>
      </div>
    `,
  });
}

export async function sendSpamAlert(
  email: string,
  name: string,
  accountEmail: string,
  spamRate: number
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `[ALERT] High spam rate detected for ${accountEmail}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#f1f0fb;padding:40px;border-radius:12px">
        <h2 style="color:#f59e0b">Spam Detection Alert</h2>
        <p style="color:#c4c3dd">Hi ${name}, warm-up emails from <strong>${accountEmail}</strong> are landing in spam at a rate of <strong>${Math.round(spamRate * 100)}%</strong>.</p>
        <p style="color:#c4c3dd">EWU has automatically reduced the sending volume. Consider pausing and reviewing your email authentication settings.</p>
        <a href="${APP_URL}/dashboard/accounts" style="background:linear-gradient(135deg,#10016c,#7e0000);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
          Review Account
        </a>
      </div>
    `,
  });
}

export async function sendTrialEndingEmail(
  email: string,
  name: string,
  daysLeft: number
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your EWU trial ends in ${daysLeft} days`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#f1f0fb;padding:40px;border-radius:12px">
        <h2 style="color:#f1f0fb">Trial Ending Soon</h2>
        <p style="color:#c4c3dd">Hi ${name}, your free trial ends in <strong>${daysLeft} days</strong>. Upgrade now to keep your warm-up campaigns running.</p>
        <a href="${APP_URL}/dashboard/billing" style="background:linear-gradient(135deg,#10016c,#7e0000);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;margin-top:16px">
          Upgrade Now
        </a>
      </div>
    `,
  });
}

export async function sendCampaignCompleteEmail(
  email: string,
  name: string,
  campaignName: string,
  reputationScore: number
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Campaign Complete: ${campaignName}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#f1f0fb;padding:40px;border-radius:12px">
        <h2 style="color:#22c55e">Warm-Up Complete!</h2>
        <p style="color:#c4c3dd">Hi ${name}, your campaign <strong>${campaignName}</strong> has completed 30 days of warm-up.</p>
        <p style="color:#c4c3dd">Final reputation score: <strong style="color:#22c55e">${reputationScore}/100</strong></p>
        <p style="color:#c4c3dd">Your email account is now ready for full-volume sending!</p>
        <a href="${APP_URL}/dashboard" style="background:linear-gradient(135deg,#10016c,#7e0000);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
          View Dashboard
        </a>
      </div>
    `,
  });
}
