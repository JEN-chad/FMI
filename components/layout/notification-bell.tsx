"use client";

import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const NOTIFICATION_ICON_MAP: Record<string, string> = {
  OFFER_RECEIVED: "💼",
  OFFER_ACCEPTED: "✅",
  OFFER_REJECTED: "❌",
  DEAL_CREATED: "🤝",
  DEAL_UPDATED: "📊",
  LISTING_APPROVED: "🎉",
  LISTING_REJECTED: "🚫",
  KYC_APPROVED: "✅",
  KYC_REJECTED: "❌",
  NEW_MESSAGE: "💬",
  SYSTEM: "📢",
};

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, isOpen, setIsOpen, markRead, markAllRead } = useNotifications(
    (user as { id?: string })?.id ?? ""
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger render={
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      } />

      <PopoverContent align="end" className="w-80 p-0 overflow-hidden shadow-xl" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] text-brand hover:underline font-medium"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2 px-4">
              <Bell className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-[11px] text-muted-foreground/60">You'll see deal updates, offers, and KYC alerts here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markRead(notification.id)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors",
                    !notification.isRead && "bg-brand/5"
                  )}
                >
                  <span className="text-lg shrink-0 mt-0.5">
                    {NOTIFICATION_ICON_MAP[notification.type] ?? "📬"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-medium leading-snug truncate", !notification.isRead && "text-foreground font-semibold")}>
                      {notification.title}
                    </p>
                    {notification.body && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                        {notification.body}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-brand mt-1.5 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
