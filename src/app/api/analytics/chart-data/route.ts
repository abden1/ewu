import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { subDays, format } from "date-fns";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const days = 14;
  const since = subDays(new Date(), days);

  const logs = await prisma.emailLog.findMany({
    where: {
      emailAccount: { userId: user.id },
      createdAt: { gte: since },
      direction: "OUTBOUND",
    },
    select: { createdAt: true, placement: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by date
  const byDate: Record<string, { sent: number; inbox: number; spam: number }> = {};

  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "MMM d");
    byDate[date] = { sent: 0, inbox: 0, spam: 0 };
  }

  for (const log of logs) {
    const date = format(log.createdAt, "MMM d");
    if (!byDate[date]) byDate[date] = { sent: 0, inbox: 0, spam: 0 };
    byDate[date].sent++;
    if (log.placement === "INBOX") byDate[date].inbox++;
    if (log.placement === "SPAM") byDate[date].spam++;
  }

  const data = Object.entries(byDate).map(([date, values]) => ({ date, ...values }));

  return NextResponse.json({ data });
}
