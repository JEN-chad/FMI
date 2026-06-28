"use client";

import { NotificationBell } from "@/components/layout/notification-bell";

type SharedNavbarProps = {
  status?: string;
};

export function SharedNavbar({ status }: SharedNavbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {status ? (
          <>
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs font-medium text-muted-foreground">{status}</span>
          </>
        ) : null}
      </div>
      <NotificationBell />
    </header>
  );
}


