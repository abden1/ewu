import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccountDetailClient } from "@/components/accounts/AccountDetailClient";
import { CheckCircle, XCircle, Shield, Mail, Calendar } from "lucide-react";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const account = await prisma.emailAccount.findFirst({
    where: { id, userId: user.id },
    include: {
      domainRecord: true,
      reputationHistory: {
        orderBy: { recordedAt: "desc" },
        take: 30,
      },
      campaigns: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!account) notFound();

  const statusVariant: Record<string, string> = {
    CONNECTED: "success",
    PENDING: "secondary",
    ERROR: "destructive",
    SUSPENDED: "warning",
  };

  const campaignStatusVariant: Record<string, string> = {
    ACTIVE: "success",
    PAUSED: "warning",
    PENDING: "secondary",
    COMPLETED: "navy",
    ERROR: "destructive",
  };

  // Serialize for client component
  const accountData = {
    id: account.id,
    email: account.email,
    displayName: account.displayName,
    provider: account.provider,
    status: account.status,
    reputationScore: account.reputationScore,
    isInPool: account.isInPool,
    lastTestedAt: account.lastTestedAt?.toISOString() ?? null,
    lastSmtpError: account.lastSmtpError,
    lastImapError: account.lastImapError,
    createdAt: account.createdAt.toISOString(),
  };

  const reputationHistory = account.reputationHistory.map((r) => ({
    score: r.score,
    inboxPlacementRate: r.inboxPlacementRate,
    openRate: r.openRate,
    bounceRate: r.bounceRate,
    spamRate: r.spamRate,
    recordedAt: r.recordedAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black">{account.displayName || account.email}</h2>
          <p className="text-muted-foreground text-sm">{account.email}</p>
        </div>
        <Badge variant={(statusVariant[account.status] || "secondary") as any}>
          {account.status}
        </Badge>
      </div>

      {/* Error banner */}
      {(account.lastSmtpError || account.lastImapError) && (
        <div className="rounded-lg border border-red-600/30 bg-red-600/10 p-4">
          <p className="text-sm font-semibold text-red-400 mb-1">Connection Errors</p>
          {account.lastSmtpError && (
            <p className="text-sm text-muted-foreground">SMTP: {account.lastSmtpError}</p>
          )}
          {account.lastImapError && (
            <p className="text-sm text-muted-foreground">IMAP: {account.lastImapError}</p>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {/* Reputation */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-black mb-1" style={{
                background: "linear-gradient(135deg, #10016c, #7e0000)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {account.reputationScore}
              </div>
              <div className="text-xs text-muted-foreground">Reputation Score</div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${account.reputationScore}%`,
                    background: "linear-gradient(90deg, #10016c, #7e0000)",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold">{account.provider}</div>
                <div className="text-xs text-muted-foreground">Email Provider</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Added */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold">
                  {new Date(account.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">Date Added</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DNS Auth */}
      <Card>
        <CardHeader>
          <CardTitle>DNS Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          {account.domainRecord ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "SPF", valid: account.domainRecord.spfValid, record: account.domainRecord.spfRecord },
                  { label: "DKIM", valid: account.domainRecord.dkimValid, record: account.domainRecord.dkimRecord },
                  { label: "DMARC", valid: account.domainRecord.dmarcValid, record: account.domainRecord.dmarcRecord },
                ].map((r) => (
                  <div
                    key={r.label}
                    className={`rounded-lg p-3 ${r.valid ? "bg-green-600/10" : "bg-muted"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {r.valid
                        ? <CheckCircle className="h-4 w-4 text-green-400" />
                        : <XCircle className="h-4 w-4 text-muted-foreground" />
                      }
                      <span className="text-sm font-semibold">{r.label}</span>
                    </div>
                    {r.record && (
                      <p className="text-xs text-muted-foreground font-mono truncate">{r.record}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className={`flex items-center gap-2 rounded-lg p-3 ${account.domainRecord.isBlacklisted ? "bg-red-600/10" : "bg-green-600/10"}`}>
                <Shield className={`h-4 w-4 flex-shrink-0 ${account.domainRecord.isBlacklisted ? "text-red-400" : "text-green-400"}`} />
                <div>
                  <span className="text-sm font-semibold">
                    {account.domainRecord.isBlacklisted ? "Blacklisted" : "Not Blacklisted"}
                  </span>
                  {account.domainRecord.isBlacklisted && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      On: {(account.domainRecord.blacklistedOn as string[]).join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {account.domainRecord.lastCheckedAt && (
                <p className="text-xs text-muted-foreground">
                  Last checked: {new Date(account.domainRecord.lastCheckedAt).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              DNS records not yet verified. They will be checked automatically.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Campaigns */}
      {account.campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {account.campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="text-sm font-semibold">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Day {campaign.currentDay}/{campaign.totalDayTarget} · {campaign.speed}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {campaign.totalSent} sent
                    </span>
                    <Badge variant={(campaignStatusVariant[campaign.status] || "secondary") as any} className="text-[10px]">
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client-side: reputation chart + pool toggle + test button */}
      <AccountDetailClient
        account={accountData}
        reputationHistory={reputationHistory}
      />
    </div>
  );
}
