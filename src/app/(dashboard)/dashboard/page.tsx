import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { Mail, TrendingUp, SendHorizonal, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [accounts, campaigns, logs, subscription] = await Promise.all([
    prisma.emailAccount.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.warmupCampaign.findMany({ where: { userId: user.id }, include: { emailAccount: true }, orderBy: { createdAt: "desc" } }),
    prisma.emailLog.findMany({
      where: { emailAccount: { userId: user.id } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.subscription.findUnique({ where: { userId: user.id } }),
  ]);

  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE");
  const avgReputation = accounts.length
    ? Math.round(accounts.reduce((sum, a) => sum + a.reputationScore, 0) / accounts.length)
    : 0;
  const totalSent = campaigns.reduce((sum, c) => sum + c.totalSent, 0);
  const totalInbox = campaigns.reduce((sum, c) => sum + c.inboxCount, 0);
  const totalKnown = totalInbox + campaigns.reduce((sum, c) => sum + c.spamCount, 0);
  const inboxRate = totalKnown > 0 ? Math.round((totalInbox / totalKnown) * 100) : 0;

  const trialEndsAt = subscription?.trialEndsAt;
  const isTrialing = subscription?.status === "TRIALING";
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="space-y-6">
      {/* Trial banner */}
      {isTrialing && daysLeft <= 3 && (
        <div className="rounded-lg border border-yellow-600/30 bg-yellow-600/10 p-4 flex items-center justify-between">
          <p className="text-sm text-yellow-400 font-medium">
            Your free trial ends in <strong>{daysLeft} days</strong>. Upgrade to keep your campaigns running.
          </p>
          <Link href="/dashboard/billing">
            <Button size="sm">Upgrade now</Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Accounts</span>
              <Mail className="h-4 w-4 text-brand-red" />
            </div>
            <div className="text-3xl font-black">{accounts.length}</div>
            <div className="text-xs text-muted-foreground mt-1">{activeCampaigns.length} active campaigns</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg Reputation</span>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black">{avgReputation}</div>
            <Progress value={avgReputation} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Sent</span>
              <SendHorizonal className="h-4 w-4 text-green-400" />
            </div>
            <div className="text-3xl font-black">{totalSent.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">warm-up emails</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Inbox Rate</span>
              <ShieldAlert className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black">{inboxRate}%</div>
            <Progress value={inboxRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts */}
        <div className="lg:col-span-2">
          <DashboardCharts userId={user.id} />
        </div>

        {/* Account list */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Accounts</CardTitle>
              <Link href="/dashboard/accounts">
                <Button variant="ghost" size="sm" className="text-xs">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No accounts yet</p>
                <Link href="/dashboard/accounts">
                  <Button size="sm" className="mt-3">Add account</Button>
                </Link>
              </div>
            ) : (
              accounts.slice(0, 5).map((account) => (
                <Link key={account.id} href={`/dashboard/accounts/${account.id}`}>
                  <div className="flex items-center justify-between rounded-lg p-3 hover:bg-muted transition-colors">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{account.email}</div>
                      <div className="text-xs text-muted-foreground">{account.provider}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold">{account.reputationScore}</span>
                      <Badge
                        variant={
                          account.status === "CONNECTED" ? "success" :
                          account.status === "ERROR" ? "destructive" : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {account.status.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet. Start a campaign to see emails here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${log.direction === "OUTBOUND" ? "bg-blue-400" : "bg-green-400"}`} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{log.subject}</div>
                      <div className="text-xs text-muted-foreground">
                        {log.direction === "OUTBOUND" ? `To: ${log.toAddress}` : `From: ${log.fromAddress}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {log.placement !== "UNKNOWN" && (
                      <Badge variant={log.placement === "INBOX" ? "success" : "destructive"} className="text-[10px]">
                        {log.placement.toLowerCase()}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(log.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
