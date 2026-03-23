import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { CheckCircle, XCircle, Shield } from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const accounts = await prisma.emailAccount.findMany({
    where: { userId: user.id },
    include: {
      domainRecord: true,
      reputationHistory: { orderBy: { recordedAt: "desc" }, take: 30 },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Analytics</h2>
        <p className="text-muted-foreground text-sm">Email performance and reputation metrics</p>
      </div>

      <AnalyticsCharts />

      {/* Domain records */}
      <div>
        <h3 className="text-lg font-bold mb-4">Domain Health</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold truncate">{account.email}</CardTitle>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold">{account.reputationScore}/100</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* DNS Auth */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "SPF", valid: account.domainRecord?.spfValid },
                    { label: "DKIM", valid: account.domainRecord?.dkimValid },
                    { label: "DMARC", valid: account.domainRecord?.dmarcValid },
                  ].map((record) => (
                    <div key={record.label} className={`rounded-lg p-2 text-center ${record.valid ? "bg-green-600/10" : "bg-muted"}`}>
                      <div className="flex justify-center mb-1">
                        {record.valid
                          ? <CheckCircle className="h-4 w-4 text-green-400" />
                          : <XCircle className="h-4 w-4 text-muted-foreground" />
                        }
                      </div>
                      <div className="text-xs font-semibold">{record.label}</div>
                    </div>
                  ))}
                </div>

                {/* Blacklist status */}
                <div className={`flex items-center gap-2 rounded-lg p-2 ${account.domainRecord?.isBlacklisted ? "bg-red-600/10" : "bg-green-600/10"}`}>
                  <Shield className={`h-4 w-4 ${account.domainRecord?.isBlacklisted ? "text-red-400" : "text-green-400"}`} />
                  <span className="text-sm">
                    {account.domainRecord?.isBlacklisted
                      ? `Blacklisted on: ${(account.domainRecord.blacklistedOn as string[]).join(", ")}`
                      : "Not on any blacklists"
                    }
                  </span>
                </div>

                {account.domainRecord?.lastCheckedAt && (
                  <p className="text-xs text-muted-foreground">
                    Last checked: {new Date(account.domainRecord.lastCheckedAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {accounts.length === 0 && (
            <Card className="md:col-span-2">
              <CardContent className="py-8 text-center text-muted-foreground">
                No accounts connected yet
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
