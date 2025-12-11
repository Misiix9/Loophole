"use client";

import { DashboardSidebar } from "@/components/dashboard-sidebar";

export function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto bg-background transition-colors duration-300">
        {children}
      </main>
    </div>
  );
}
