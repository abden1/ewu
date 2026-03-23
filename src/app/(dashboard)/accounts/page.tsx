"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AddAccountDialog } from "@/components/accounts/AddAccountDialog";
import { Mail, Plus, Trash2, TestTube, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";

interface Account {
  id: string;
  email: string;
  displayName: string;
  provider: string;
  status: string;
  reputationScore: number;
  isInPool: boolean;
  lastTestedAt: string | null;
  lastSmtpError: string | null;
  campaigns: { id: string; status: string }[];
  domainRecord: { spfValid: boolean; dkimValid: boolean; dmarcValid: boolean; isBlacklisted: boolean } | null;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);

  async function fetchAccounts() {
    const res = await fetch("/api/accounts");
    const data = await res.json();
    setAccounts(data.accounts || []);
    setLoading(false);
  }

  useEffect(() => { fetchAccounts(); }, []);

  async function handleTest(id: string) {
    setTestingId(id);
    const res = await fetch(`/api/accounts/${id}/test`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      toast.success("Connection successful!");
    } else {
      toast.error(`Connection failed: ${data.smtp?.error || data.imap?.error || "Unknown error"}`);
    }
    setTestingId(null);
    fetchAccounts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this account? All associated campaigns and logs will be deleted.")) return;
    const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Account deleted");
      fetchAccounts();
    } else {
      toast.error("Failed to delete account");
    }
  }

  const statusVariant = (status: string) => {
    if (status === "CONNECTED") return "success";
    if (status === "ERROR") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Email Accounts</h2>
          <p className="text-muted-foreground text-sm">Connect and manage your email accounts</p>
        </div>
        <AddAccountDialog onSuccess={fetchAccounts} />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Mail className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No accounts yet</h3>
            <p className="text-muted-foreground mb-6">Connect your first email account to start warming up.</p>
            <AddAccountDialog onSuccess={fetchAccounts} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((account) => {
            const authScore = account.domainRecord
              ? [account.domainRecord.spfValid, account.domainRecord.dkimValid, account.domainRecord.dmarcValid].filter(Boolean).length
              : 0;

            return (
              <Card key={account.id} className="hover:border-brand-navy/40 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{account.email}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{account.provider} · {account.isInPool ? "In pool" : "Not in pool"}</div>
                    </div>
                    <Badge variant={statusVariant(account.status) as any}>{account.status.toLowerCase()}</Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Reputation</span>
                      <span className="font-bold">{account.reputationScore}/100</span>
                    </div>
                    <Progress value={account.reputationScore} />
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {["SPF", "DKIM", "DMARC"].map((record, i) => {
                      const valid = account.domainRecord
                        ? [account.domainRecord.spfValid, account.domainRecord.dkimValid, account.domainRecord.dmarcValid][i]
                        : false;
                      return (
                        <Badge key={record} variant={valid ? "success" : "secondary"} className="text-[10px]">
                          {record}
                        </Badge>
                      );
                    })}
                    {account.domainRecord?.isBlacklisted && (
                      <Badge variant="destructive" className="text-[10px]">BLACKLISTED</Badge>
                    )}
                  </div>

                  {account.lastTestedAt && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Last tested {formatRelativeTime(account.lastTestedAt)}
                      {account.lastSmtpError && <span className="text-red-400 ml-1">• {account.lastSmtpError}</span>}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTest(account.id)}
                      disabled={testingId === account.id}
                    >
                      <TestTube className="h-3 w-3" />
                      {testingId === account.id ? "Testing..." : "Test"}
                    </Button>
                    <Link href={`/dashboard/accounts/${account.id}`}>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3" />
                        Details
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      onClick={() => handleDelete(account.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
