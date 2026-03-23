"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface AccountData {
  id: string;
  email: string;
  displayName: string | null;
  provider: string;
  status: string;
  reputationScore: number;
  isInPool: boolean;
  lastTestedAt: string | null;
  lastSmtpError: string | null;
  lastImapError: string | null;
  createdAt: string;
}

interface ReputationPoint {
  score: number;
  inboxPlacementRate: number;
  openRate: number;
  bounceRate: number;
  spamRate: number;
  recordedAt: string;
}

interface AccountDetailClientProps {
  account: AccountData;
  reputationHistory: ReputationPoint[];
}

export function AccountDetailClient({
  account,
  reputationHistory,
}: AccountDetailClientProps) {
  const [isInPool, setIsInPool] = useState(account.isInPool);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    smtp: boolean;
    imap: boolean;
    smtpError?: string;
    imapError?: string;
  } | null>(null);
  const [togglingPool, setTogglingPool] = useState(false);

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/accounts/${account.id}/test`, { method: "POST" });
      const data = await res.json();
      setTestResult(data);
      if (data.smtp && data.imap) {
        toast.success("Connection test passed!");
      } else {
        toast.error("Connection test failed");
      }
    } catch {
      toast.error("Test failed");
    } finally {
      setTesting(false);
    }
  }

  async function handlePoolToggle(val: boolean) {
    setTogglingPool(true);
    try {
      const res = await fetch(`/api/accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isInPool: val }),
      });
      if (res.ok) {
        setIsInPool(val);
        toast.success(val ? "Joined warm-up pool" : "Left warm-up pool");
      } else {
        toast.error("Failed to update pool status");
      }
    } catch {
      toast.error("Failed to update pool status");
    } finally {
      setTogglingPool(false);
    }
  }

  const chartData = [...reputationHistory]
    .reverse()
    .map((r) => ({
      date: new Date(r.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: r.score,
      inbox: Math.round(r.inboxPlacementRate * 100),
    }));

  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--foreground)",
    fontSize: "12px",
  };

  return (
    <div className="space-y-4">
      {/* Reputation History Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Reputation History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#8b8aa5", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#8b8aa5", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10016c"
                  strokeWidth={2}
                  dot={false}
                  name="Score"
                />
                <Line
                  type="monotone"
                  dataKey="inbox"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  name="Inbox %"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-4 rounded-full bg-[#10016c]" />
                <span className="text-xs text-muted-foreground">Reputation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-4 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Inbox %</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pool toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Warm-Up Pool</Label>
              <p className="text-xs text-muted-foreground">
                Join the shared pool to exchange warm-up emails with other EWU users
              </p>
            </div>
            <Switch
              checked={isInPool}
              onCheckedChange={handlePoolToggle}
              disabled={togglingPool || account.status !== "CONNECTED"}
            />
          </div>

          {isInPool && (
            <div className="rounded-lg bg-green-600/10 border border-green-600/20 p-3">
              <p className="text-xs text-green-400">
                This account is actively participating in the warm-up pool and exchanging emails with other users.
              </p>
            </div>
          )}

          {/* Test connection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Test Connection</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Verify SMTP and IMAP credentials are working
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={testing}
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {testing ? "Testing..." : "Test Now"}
              </Button>
            </div>

            {testResult && (
              <div className="grid grid-cols-2 gap-2">
                <div className={`rounded-lg p-2 text-center text-sm ${testResult.smtp ? "bg-green-600/10 text-green-400" : "bg-red-600/10 text-red-400"}`}>
                  SMTP: {testResult.smtp ? "OK" : "Failed"}
                  {testResult.smtpError && (
                    <p className="text-xs mt-1 text-muted-foreground">{testResult.smtpError}</p>
                  )}
                </div>
                <div className={`rounded-lg p-2 text-center text-sm ${testResult.imap ? "bg-green-600/10 text-green-400" : "bg-red-600/10 text-red-400"}`}>
                  IMAP: {testResult.imap ? "OK" : "Failed"}
                  {testResult.imapError && (
                    <p className="text-xs mt-1 text-muted-foreground">{testResult.imapError}</p>
                  )}
                </div>
              </div>
            )}

            {account.lastTestedAt && (
              <p className="text-xs text-muted-foreground">
                Last tested: {new Date(account.lastTestedAt).toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
