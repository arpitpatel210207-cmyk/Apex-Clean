"use client";

import { useEffect, useState } from "react";

import { Sidebar, SidebarContent } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      <div className="flex min-h-screen text-text">
        {/* Sidebar */}
        <aside className="hidden bg-bg lg:block">
          <Sidebar />
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Content */}
          <main className="dashboard-content flex-1 overflow-hidden bg-bg p-3 sm:p-4 lg:p-6">
            <div className="surface flex h-[calc(100dvh-1.5rem)] flex-col overflow-hidden lg:h-[calc(100vh-3rem)]">
              <div className="scrollbar-hide flex-1 overflow-x-hidden overflow-y-auto">
                <Topbar onMenuClick={() => setMobileOpen(true)} />
                <div className="px-3 pb-4 pt-2 sm:px-4 sm:pb-5 lg:px-6 lg:pb-6">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#121212]/70"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />

          <div className="fixed inset-y-0 left-0 w-[248px] bg-bg p-1 shadow-xl">
            <SidebarContent compact expanded onNavigate={() => setMobileOpen(false)} />

            <button
              className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md border border-border px-2 py-1 text-text"
              onClick={() => setMobileOpen(false)}
            >
              x
            </button>
          </div>
        </div>
      )}
    </>
  );
}
