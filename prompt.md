## 2. EMAIL WARM-UP SERVICE

### Detailed Specifications

**Core Features:**

- Email account connection (IMAP/SMTP)
- Automated email sending between warm-up pool
- Gradual volume increase algorithm
- Spam folder monitoring
- Sender reputation scoring
- Custom warm-up schedules
- Inbox placement rate tracking
- Domain reputation monitoring
- Automatic reply generation
- Blacklist monitoring
- Email provider detection (Gmail, Outlook, custom)

**Tech Stack:**

- Frontend: React + TypeScript
- Backend: Node.js + Bull Queue for job processing
- Database: PostgreSQL + Redis for queuing
- Email: Nodemailer with IMAP/SMTP
- Monitoring: Custom spam detection algorithms

**Monetization:**

- Starter ($20/mo): 1 email account
- Pro ($50/mo): 5 email accounts
- Agency ($200/mo): 50 email accounts

**MVP Scope:**

1. Email account connection via IMAP/SMTP
2. Warm-up algorithm (gradual sending increase)
3. Automated email exchange between accounts
4. Basic reputation dashboard

---

### DEVELOPMENT PROMPT FOR EMAIL WARM-UP SERVICE

```
Build a SaaS platform that automatically warms up email addresses to improve deliverability and avoid spam folders.

CORE REQUIREMENTS:

1. EMAIL ACCOUNT MANAGEMENT
- Connect email accounts via IMAP/SMTP credentials
- Support for: Gmail, Outlook, Yahoo, custom SMTP servers
- OAuth integration for Gmail and Outlook
- Secure credential storage (encrypted)
- Email provider auto-detection
- Account health status indicators
- Connection testing and validation

2. WARM-UP ALGORITHM ENGINE
- Gradual sending volume increase:
  * Day 1-3: 5-10 emails/day
  * Day 4-7: 15-20 emails/day
  * Day 8-14: 25-35 emails/day
  * Day 15-21: 40-50 emails/day
  * Day 22-30: 60-80 emails/day
- Customizable warm-up schedules
- Random timing between emails (appear human-like)
- Email content variation (different templates)
- Automatic domain rotation
- Reply simulation with delay

3. EMAIL POOL SYSTEM
- Network of warm-up accounts for email exchange
- Match accounts based on: domain reputation, email provider, industry
- Bidirectional email sending (A→B, B→A)
- Email content generation:
  * Professional templates (business, networking, follow-up)
  * Variable insertion (names, topics, dates)
  * Natural language variation
  * Subject line diversity
- Automatic reply generation with AI

4. SPAM FOLDER MONITORING
- Periodic inbox vs spam folder checking
- IMAP folder scanning for email placement
- Spam detection rate calculation
- Alert when emails land in spam
- Automatic adjustment of sending patterns

5. SENDER REPUTATION TRACKING
- Reputation score calculation (0-100)
- Factors tracked:
  * Inbox placement rate
  * Email open rates (tracking pixels)
  * Spam complaints
  * Bounce rate
  * Authentication status (SPF, DKIM, DMARC)
- Historical reputation trends
- Comparison with industry benchmarks

6. DOMAIN & IP MONITORING
- DNS record verification (SPF, DKIM, DMARC)
- Real-time blacklist checking (Spamhaus, SpamCop, Barracuda)
- IP reputation scoring
- Domain age and history analysis
- SSL/TLS verification
- Alert system for blacklist additions

7. ANALYTICS DASHBOARD
- Key metrics:
  * Warm-up progress (% complete)
  * Daily sending volume
  * Inbox placement rate
  * Spam folder rate
  * Domain reputation score
  * Authentication status
- Charts: sending volume over time, placement rate trends
- Email activity log (sent, received, opened)
- Export reports (PDF, CSV)

8. SETTINGS & CUSTOMIZATION
- Warm-up speed: Slow (conservative), Medium, Fast (aggressive)
- Sending schedule: business hours only, 24/7, custom timeframes
- Email templates: select categories (business, casual, technical)
- Timezone configuration
- Pause/resume warm-up campaigns
- Email signature customization

9. NOTIFICATION SYSTEM
- Email alerts for: account disconnection, spam placement, blacklist detection
- Slack/Discord webhooks
- In-app notifications
- Weekly progress reports

10. SUBSCRIPTION MANAGEMENT
- Tiered pricing based on email account slots
- Stripe integration for billing
- Usage tracking per account
- Upgrade/downgrade handling
- Free trial (7 days, 1 account)

TECHNICAL IMPLEMENTATION:

Stack:
- Next.js 14+ with App Router
- TypeScript
- PostgreSQL with Prisma
- Redis for job queuing
- Bull/BullMQ for background jobs
- Nodemailer for SMTP sending
- IMAP client (node-imap or imap-simple)
- Encryption: bcrypt for credentials, crypto for sensitive data
- Monitoring: Sentry for error tracking

Background Job System:
- Email sending jobs (queued with Bull)
- Inbox checking jobs (every 6 hours)
- Blacklist monitoring (daily)
- Reputation calculation (hourly)
- DNS record verification (daily)

Database Schema:
- Users (id, email, subscription)
- EmailAccounts (id, userId, email, imapConfig, smtpConfig, provider, status, reputationScore)
- WarmupCampaigns (id, accountId, status, startDate, progress, settings)
- EmailLogs (id, campaignId, from, to, subject, sentAt, inboxPlacement, opened)
- ReputationHistory (id, accountId, score, date)
- DomainRecords (id, accountId, spf, dkim, dmarc, lastChecked)

Key Features:
1. IMAP/SMTP connection handling with retry logic
2. Email template generation with AI (GPT-4 API optional)
3. Job queue for scheduled email sending
4. Spam folder detection via IMAP folder analysis
5. Blacklist API integration (MXToolbox, Google Safe Browsing)
6. Email open tracking with pixel beacons
7. Authentication record parsing (SPF/DKIM/DMARC)
8. Rate limiting per email provider

Security:
- Encrypted credential storage
- OAuth2 for Gmail/Outlook
- API rate limiting
- User data isolation
- Secure SMTP/IMAP connections (TLS)
- No logging of email content (privacy compliance)

UI/UX:
- Email account connection wizard
- Real-time warm-up progress indicators
- Reputation score visualization (gauges, trend lines)
- Activity timeline showing recent emails
- Quick actions: pause, resume, delete campaign
- Mobile-responsive design
- Dark mode

DELIVERABLES:
1. Email account connection and verification system
2. Automated warm-up campaign engine
3. Background job processing for email sending
4. Spam folder monitoring
5. Reputation tracking dashboard
6. Blacklist and DNS monitoring
7. Subscription and billing integration
8. Admin panel for pool management
9. Email template library
10. API for integrations

Build this with focus on deliverability best practices, security, and scalability for managing hundreds of email accounts.
```
