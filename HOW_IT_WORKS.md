# EWU — Email Warm-Up Platform

## What is EWU?

EWU automatically warms up email addresses by sending and receiving real emails between accounts in a shared pool. This trains spam filters to recognize your email as legitimate, improving your **inbox placement rate** and **sender reputation** before you launch real campaigns.

---

## How It Works — Step by Step

### 1. Connect Your Email Account

Go to **Email Accounts → Add Account**.

- Select your provider (Gmail, Outlook, Yahoo, Zoho, or Custom SMTP/IMAP)
- Enter your email address and **App Password** (see below)
- EWU tests the SMTP and IMAP connection before saving

> **Important — Gmail & Yahoo require an App Password, NOT your regular password:**
>
> - **Gmail**: Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords), create an App Password, and use the 16-character code
> - **Yahoo**: Go to [login.yahoo.com/myaccount/security](https://login.yahoo.com/myaccount/security) and generate an App Password
> - **Outlook**: Use your regular password or an app password if 2FA is enabled

---

### 2. Create a Warm-Up Campaign

Go to **Campaigns → New Campaign**.

- Choose the connected email account
- Select a **warm-up speed**:
  - **Slow** — starts at 2 emails/day, increases gradually over 45 days (safest)
  - **Medium** — starts at 5 emails/day, increases over 30 days (recommended)
  - **Fast** — starts at 10 emails/day, increases over 20 days (for already-established domains)
- Configure schedule (timezone, business hours only, start/end hour)
- Choose email template categories (business, networking, casual)

---

### 3. The Warm-Up Engine Runs Automatically

Once the campaign is **Active**, EWU does everything automatically:

1. **Sends emails** — EWU sends warm-up emails from your account to other accounts in the pool using realistic, human-like templates
2. **Receives replies** — Other pool accounts receive and reply to your emails
3. **Moves from spam** — If a warm-up email lands in spam, EWU automatically moves it to the inbox and marks it as important
4. **Tracks placement** — Every sent email is checked (via IMAP) to see if it landed in inbox or spam
5. **Increases volume gradually** — Each day the sending volume increases slightly, mimicking a real human sender

Emails are sent during business hours only (by default) to match normal human behavior.

---

### 4. Monitor Your Reputation Score

Your **Reputation Score** (0–100) is calculated from:

| Factor | Weight | What it measures |
|--------|--------|-----------------|
| Inbox placement rate | 40% | % of warm-up emails that land in inbox (not spam) |
| Open rate | 20% | % of sent emails that get opened |
| Bounce rate | 20% | % of emails that bounce (lower = better) |
| Auth score | 20% | Whether SPF, DKIM, and DMARC are configured correctly |

A score above 70 means your domain is healthy and ready for real outreach.

---

### 5. DNS Authentication (SPF / DKIM / DMARC)

EWU automatically checks your domain's DNS records:

- **SPF** — tells receiving servers which servers are allowed to send email for your domain
- **DKIM** — adds a cryptographic signature to your emails proving they weren't tampered with
- **DMARC** — tells receiving servers what to do with emails that fail SPF/DKIM

These three records together are essential for inbox delivery. EWU shows you which ones are missing and flags them.

---

### 6. Blacklist Monitoring

EWU checks your domain and IP against major blacklists daily:

- Spamhaus (SBL, XBL, DBL)
- SpamCop
- Barracuda
- SORBS

If your domain gets blacklisted, you receive an instant notification.

---

### 7. The Email Pool

All EWU users' accounts are part of a shared **warm-up pool**. When your account is in the pool:

- It sends emails to other pool accounts
- It receives and replies to emails from other pool accounts
- This creates a network of real, bidirectional email activity

The pool is what makes the warm-up effective — it looks like real human email to spam filters.

---

## Subscription Plans

| Plan | Price | Accounts | Features |
|------|-------|----------|----------|
| Free Trial | $0 | 1 | 14-day trial, all features |
| Starter | $20/mo | 3 | Full warm-up engine |
| Pro | $50/mo | 10 | Priority pool + analytics |
| Agency | $200/mo | 50 | All features + bulk management |

---

## Cron Jobs (Automated Tasks)

EWU runs the following background tasks automatically:

| Task | Schedule | What it does |
|------|----------|-------------|
| Send warm-up emails | Daily 9am UTC (weekdays) | Sends emails from all active campaigns |
| Check inbox | Daily 10am UTC | Scans IMAP to verify email placement |
| Update reputation | Daily 11am UTC | Recalculates reputation scores |
| Verify DNS | Daily 3am UTC | Checks SPF/DKIM/DMARC records |
| Check blacklists | Daily 2am UTC | Checks domain/IP against blacklists |

---

## Frequently Asked Questions

**Q: Will this affect my real emails?**
A: No. EWU only uses a separate IMAP/SMTP connection for warm-up emails. Your regular email client is not affected.

**Q: How long does warm-up take?**
A: Typically 3–6 weeks depending on the speed setting. You should see reputation score improvements within the first week.

**Q: What email providers are supported?**
A: Gmail, Outlook, Yahoo, Zoho, and any custom SMTP/IMAP provider (e.g. Amazon SES, SendGrid, your own mail server).

**Q: My Gmail shows "Application-specific password required" — what do I do?**
A: Gmail requires an App Password when 2-Step Verification is enabled. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords), create a password for "EWU", and use that 16-character code as your password in EWU.

**Q: Can I pause a campaign?**
A: Yes. Go to Campaigns, open the campaign, and click Pause. The warm-up progress is preserved and resumes from where it left off when you restart.

**Q: What happens when the warm-up completes?**
A: You receive a notification. Your account remains in the pool at a maintenance level (low sending volume) to preserve the reputation you've built.
