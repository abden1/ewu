"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationListProps {
  notifications: Notification[];
}

const TYPE_VARIANT: Record<string, string> = {
  BLACKLIST_ADDED: "destructive",
  SPAM_DETECTED: "warning",
  REPUTATION_DROP: "warning",
  CAMPAIGN_COMPLETED: "success",
  BLACKLIST_REMOVED: "success",
};

export function NotificationList({ notifications: initial }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initial);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((n) => n.map((notif) => ({ ...notif, isRead: true })));
    toast.success("All notifications marked as read");
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No notifications yet</p>
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-3">
      {unread > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        </div>
      )}
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`rounded-lg p-3 ${notif.isRead ? "opacity-60" : "bg-muted/50"}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">{notif.title}</span>
                <Badge variant={(TYPE_VARIANT[notif.type] || "secondary") as any} className="text-[10px]">
                  {notif.type.replace(/_/g, " ").toLowerCase()}
                </Badge>
                {!notif.isRead && <div className="h-2 w-2 rounded-full bg-brand-red flex-shrink-0" />}
              </div>
              <p className="text-sm text-muted-foreground">{notif.body}</p>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatRelativeTime(notif.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
