"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChartData {
  date: string;
  sent: number;
  inbox: number;
  spam: number;
}

export function DashboardCharts({ userId }: { userId: string }) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/chart-data")
      .then((r) => r.json())
      .then((d) => {
        setData(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading charts...</div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground text-sm">No data yet</div>
          <div className="text-xs text-muted-foreground mt-1">Start a campaign to see charts</div>
        </div>
      </Card>
    );
  }

  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--foreground)",
    fontSize: "12px",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Email Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="volume">
          <TabsList className="mb-4">
            <TabsTrigger value="volume">Sending Volume</TabsTrigger>
            <TabsTrigger value="placement">Inbox Placement</TabsTrigger>
          </TabsList>

          <TabsContent value="volume">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10016c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10016c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#8b8aa5", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8b8aa5", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="sent" stroke="#10016c" fill="url(#sentGradient)" strokeWidth={2} name="Sent" />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="placement">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data}>
                <XAxis dataKey="date" tick={{ fill: "#8b8aa5", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8b8aa5", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="inbox" fill="#22c55e" name="Inbox" radius={[3, 3, 0, 0]} />
                <Bar dataKey="spam" fill="#ef4444" name="Spam" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
