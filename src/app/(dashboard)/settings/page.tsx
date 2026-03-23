import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { NotificationList } from "@/components/settings/NotificationList";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [dbUser, notifications] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id } }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-black">Settings</h2>
        <p className="text-muted-foreground text-sm">Manage your account preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm name={dbUser?.name || ""} email={dbUser?.email || user.email || ""} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <Badge variant="secondary">{notifications.filter((n) => !n.isRead).length} unread</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <NotificationList notifications={notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))} />
        </CardContent>
      </Card>
    </div>
  );
}
