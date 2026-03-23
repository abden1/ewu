"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Plus, Play, Pause, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  status: string;
  speed: string;
  currentDay: number;
  totalDayTarget: number;
  totalSent: number;
  inboxCount: number;
  spamCount: number;
  emailAccount: { email: string; provider: string; reputationScore: number };
}

interface Account {
  id: string;
  email: string;
  status: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: "", emailAccountId: "", speed: "MEDIUM" });

  async function fetchData() {
    const [campaignsRes, accountsRes] = await Promise.all([
      fetch("/api/campaigns"),
      fetch("/api/accounts"),
    ]);
    const [campaignsData, accountsData] = await Promise.all([campaignsRes.json(), accountsRes.json()]);
    setCampaigns(campaignsData.campaigns || []);
    setAccounts((accountsData.accounts || []).filter((a: Account) => a.status === "CONNECTED"));
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleAction(id: string, action: string) {
    setActionId(id);
    const res = await fetch(`/api/campaigns/${id}/${action}`, { method: "POST" });
    if (res.ok) {
      toast.success(`Campaign ${action}ed`);
      fetchData();
    } else {
      const err = await res.json();
      toast.error(err.error || "Action failed");
    }
    setActionId(null);
  }

  async function handleCreate() {
    if (!newCampaign.name || !newCampaign.emailAccountId) {
      toast.error("Please fill in all fields");
      return;
    }
    setCreating(true);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCampaign),
    });
    if (res.ok) {
      toast.success("Campaign created!");
      setCreateOpen(false);
      setNewCampaign({ name: "", emailAccountId: "", speed: "MEDIUM" });
      fetchData();
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to create campaign");
    }
    setCreating(false);
  }

  const statusVariant = (status: string) => {
    if (status === "ACTIVE") return "success";
    if (status === "PAUSED") return "warning";
    if (status === "COMPLETED") return "navy";
    if (status === "ERROR") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Campaigns</h2>
          <p className="text-muted-foreground text-sm">Manage your warm-up campaigns</p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> New Campaign</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Warm-Up Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Campaign Name</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. Main outreach account"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign((n) => ({ ...n, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Email Account</Label>
                <Select value={newCampaign.emailAccountId} onValueChange={(v) => setNewCampaign((n) => ({ ...n, emailAccountId: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {accounts.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    No connected accounts. <Link href="/dashboard/accounts" className="text-brand-red hover:underline">Add one first.</Link>
                  </p>
                )}
              </div>
              <div>
                <Label>Warm-Up Speed</Label>
                <Select value={newCampaign.speed} onValueChange={(v) => setNewCampaign((n) => ({ ...n, speed: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SLOW">Slow (conservative, 3-55/day)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (standard, 5-80/day)</SelectItem>
                    <SelectItem value="FAST">Fast (aggressive, 8-90/day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleCreate} disabled={creating} className="flex-1">
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Campaign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2].map((i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Zap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-6">Create your first warm-up campaign to start.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((campaign) => {
            const progress = campaign.totalDayTarget > 0 ? (campaign.currentDay / campaign.totalDayTarget) * 100 : 0;
            const known = campaign.inboxCount + campaign.spamCount;
            const inboxRate = known > 0 ? Math.round((campaign.inboxCount / known) * 100) : 0;

            return (
              <Card key={campaign.id} className="hover:border-brand-navy/40 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold">{campaign.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{campaign.emailAccount.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{campaign.speed}</Badge>
                      <Badge variant={statusVariant(campaign.status) as any}>{campaign.status.toLowerCase()}</Badge>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Day {campaign.currentDay} of {campaign.totalDayTarget}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                    <div className="rounded-lg bg-muted p-2">
                      <div className="text-sm font-bold">{campaign.totalSent}</div>
                      <div className="text-[10px] text-muted-foreground">Sent</div>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <div className="text-sm font-bold text-green-400">{campaign.inboxCount}</div>
                      <div className="text-[10px] text-muted-foreground">Inbox</div>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <div className="text-sm font-bold">{inboxRate}%</div>
                      <div className="text-[10px] text-muted-foreground">Rate</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {campaign.status === "PENDING" || campaign.status === "PAUSED" ? (
                      <Button
                        size="sm"
                        onClick={() => handleAction(campaign.id, "start")}
                        disabled={actionId === campaign.id}
                      >
                        {actionId === campaign.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                        Start
                      </Button>
                    ) : campaign.status === "ACTIVE" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(campaign.id, "pause")}
                        disabled={actionId === campaign.id}
                      >
                        <Pause className="h-3 w-3" />
                        Pause
                      </Button>
                    ) : null}

                    {["ACTIVE", "PAUSED"].includes(campaign.status) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={() => handleAction(campaign.id, "stop")}
                        disabled={actionId === campaign.id}
                      >
                        <Square className="h-3 w-3" />
                        Stop
                      </Button>
                    )}
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
