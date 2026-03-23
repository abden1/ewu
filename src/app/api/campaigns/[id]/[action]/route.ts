import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, action } = await params;
  const campaign = await prisma.warmupCampaign.findFirst({ where: { id, userId: user.id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let updateData: Record<string, unknown> = {};

  switch (action) {
    case "start":
      if (campaign.status !== "PENDING" && campaign.status !== "PAUSED") {
        return NextResponse.json({ error: "Campaign is already running" }, { status: 400 });
      }
      updateData = {
        status: "ACTIVE",
        startedAt: campaign.startedAt || new Date(),
        pausedAt: null,
      };
      break;

    case "pause":
      if (campaign.status !== "ACTIVE") {
        return NextResponse.json({ error: "Campaign is not running" }, { status: 400 });
      }
      updateData = { status: "PAUSED", pausedAt: new Date() };
      break;

    case "stop":
      updateData = { status: "COMPLETED", completedAt: new Date() };
      break;

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await prisma.warmupCampaign.update({ where: { id }, data: updateData });
  return NextResponse.json({ campaign: updated });
}
