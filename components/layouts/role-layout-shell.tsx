"use client";

import { Toaster } from "@/components/ui/sonner";
import { SharedBreadcrumb } from "./shared-breadcrumb";
import { SharedNavbar } from "./shared-navbar";

type RoleLayoutShellProps = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  status?: string;
};

export function RoleLayoutShell({ children, sidebar, status }: RoleLayoutShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebar}
      <div className="flex flex-1 flex-col overflow-hidden">
        <SharedNavbar status={status} />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full p-6">
            <SharedBreadcrumb />
            {children}
          </div>
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}


