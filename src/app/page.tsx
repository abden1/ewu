import Image from "next/image";
import Link from "next/link";
import {
  Mail, Shield, TrendingUp, BarChart3, Bell, Zap,
  CheckCircle, ArrowRight, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: Zap,
    title: "Smart Warm-Up Engine",
    description: "Gradual volume increase over 30 days with human-like timing patterns. SLOW, MEDIUM, and FAST modes available.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: Shield,
    title: "Spam Folder Monitoring",
    description: "IMAP-based inbox scanning checks email placement every 6 hours. Get alerts when emails land in spam.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    icon: TrendingUp,
    title: "Reputation Tracking",
    description: "Real-time 0-100 reputation score based on inbox placement, open rates, bounce rate, and authentication.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Charts for sending volume, inbox placement rate, and reputation trends. Export reports as needed.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Bell,
    title: "Blacklist Monitoring",
    description: "Daily checks against Spamhaus, SpamCop, Barracuda, and SORBS. Instant alerts on detection.",
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    icon: Mail,
    title: "Email Pool System",
    description: "Bidirectional email exchange with other warm-up accounts. Natural conversation simulation with AI replies.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: 20,
    accounts: 1,
    features: [
      "1 email account",
      "30-day warm-up campaigns",
      "Spam folder monitoring",
      "Reputation tracking",
      "Basic analytics",
      "Email notifications",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: 50,
    accounts: 5,
    features: [
      "5 email accounts",
      "All Starter features",
      "Priority warm-up pool",
      "Advanced analytics",
      "Blacklist monitoring",
      "DNS verification",
      "Slack webhooks",
    ],
    popular: true,
  },
  {
    name: "Agency",
    price: 200,
    accounts: 50,
    features: [
      "50 email accounts",
      "All Pro features",
      "Custom warm-up schedules",
      "White-label reports",
      "Priority support",
      "API access",
      "Team management",
    ],
    popular: false,
  },
];

const FAQ = [
  {
    q: "How does email warm-up work?",
    a: "EWU gradually increases your sending volume over 30 days, exchanging emails with other accounts in our warm-up pool. This trains email providers to recognize you as a legitimate sender.",
  },
  {
    q: "Which email providers are supported?",
    a: "We support Gmail, Outlook, Yahoo, Zoho, and any custom SMTP/IMAP server. OAuth is available for Gmail and Outlook.",
  },
  {
    q: "How long does warm-up take?",
    a: "Our standard warm-up runs for 30 days. You can choose SLOW (conservative), MEDIUM (standard), or FAST (aggressive) speeds.",
  },
  {
    q: "What if my emails land in spam?",
    a: "EWU monitors inbox vs spam placement every 6 hours. If your spam rate spikes, we automatically reduce sending volume and alert you.",
  },
  {
    q: "Is my SMTP password secure?",
    a: "Yes. All SMTP and IMAP credentials are encrypted with AES-256-GCM before being stored. Your passwords are never accessible in plaintext.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/EWU.png" alt="EWU" width={40} height={40} className="rounded" />
            <span className="text-lg font-bold">EWU</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Start free trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pb-32 pt-36">
        <div className="absolute inset-0 gradient-brand opacity-40" />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-navy/20 blur-3xl" />
        <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-brand-red/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Badge variant="navy" className="mb-6 inline-flex">
            7-day free trial, no credit card required
          </Badge>

          <div className="mb-8 flex justify-center">
            <Image src="/EWU.png" alt="EWU" width={80} height={80} className="rounded-xl shadow-2xl" />
          </div>

          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Warm Up Your Emails.{" "}
            <span className="bg-gradient-to-r from-brand-red via-brand-brown to-brand-navy bg-clip-text text-transparent">
              Land in the Inbox.
            </span>
          </h1>

          <p className="mb-10 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            EWU automatically warms up your email addresses with gradual volume increases, spam monitoring, and reputation tracking — so your messages always reach the inbox.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" className="text-base px-8">
                Start warming up free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#pricing">
              <Button variant="outline" size="lg" className="text-base">
                View pricing
              </Button>
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {["30-day warm-up program", "Spam monitoring 24/7", "Reputation scoring"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative mx-auto mt-20 max-w-4xl px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { value: "98%", label: "Inbox Rate" },
              { value: "30 days", label: "Warm-Up Time" },
              { value: "4 DNSBL", label: "Blacklists Checked" },
              { value: "0-100", label: "Reputation Score" },
            ].map((stat) => (
              <div key={stat.label} className="card-glass rounded-xl p-6 text-center">
                <div className="text-3xl font-black text-foreground">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black">Everything you need to deliver</h2>
            <p className="mt-4 text-lg text-muted-foreground">From connection to reputation — EWU handles the full warm-up lifecycle</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card-glass rounded-xl p-6 hover:border-brand-navy/50 transition-all duration-200 border border-border">
                <div className={`mb-4 inline-flex rounded-lg p-3 ${feature.bg}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-card/30">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black">Up and running in minutes</h2>
          </div>
          <div className="space-y-8">
            {[
              { step: "01", title: "Connect your email account", desc: "Enter your IMAP/SMTP credentials or authenticate with Gmail/Outlook OAuth. EWU tests the connection and detects your provider automatically." },
              { step: "02", title: "Launch your warm-up campaign", desc: "Choose your speed (SLOW, MEDIUM, FAST) and schedule. EWU starts sending emails on day 1 and gradually increases volume over 30 days." },
              { step: "03", title: "Monitor reputation in real-time", desc: "Watch your inbox placement rate, reputation score, and domain health improve daily. Get alerts if anything needs attention." },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-navy to-brand-red text-white font-black text-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground">Start with a 7-day free trial. No credit card required.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.popular
                    ? "border-brand-red bg-gradient-to-b from-brand-red/10 to-card shadow-2xl shadow-brand-red/10"
                    : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-brand-navy to-brand-red text-white text-xs font-semibold px-3 py-1">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.accounts} email account{plan.accounts > 1 ? "s" : ""}</p>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                    Start 7-day free trial
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-card/30">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details key={item.q} className="group rounded-xl border border-border bg-card">
                <summary className="flex cursor-pointer items-center justify-between p-6 text-base font-semibold list-none">
                  {item.q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-brand-navy to-brand-red/50 p-12">
            <h2 className="text-3xl font-black mb-4">Ready to improve your deliverability?</h2>
            <p className="text-muted-foreground mb-8">Start your free 7-day warm-up trial today.</p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-brand-navy hover:bg-white/90 font-bold">
                Start free trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <Image src="/EWU.png" alt="EWU" width={32} height={32} className="rounded" />
              <span className="font-bold">EWU</span>
              <span className="text-muted-foreground text-sm">Email Warm-Up</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} EWU. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
