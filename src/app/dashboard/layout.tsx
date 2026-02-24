"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Sidebar, SidebarContent } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="flex min-h-screen text-text">
        {/* Sidebar */}
        <aside className="hidden lg:block bg-bg">
          <Sidebar />
        </aside>

        {/* Main */}
        <div className="flex-1 flex min-w-0 flex-col">

          {/* Content */}
          <main className="dashboard-content flex-1 overflow-hidden bg-bg p-6">
            <div className="surface flex h-[calc(100vh-3rem)] flex-col overflow-hidden">
              <div className="scrollbar-hide flex-1 overflow-y-auto">
                <Topbar onMenuClick={() => setMobileOpen(true)} />
                <div className="px-6 pb-6 pt-2">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#121212]/70"
            onClick={() => setMobileOpen(false)}
          />

          <div className="absolute left-0 top-0 h-full w-[82px] bg-bg shadow-xl p-1">
            <SidebarContent compact onNavigate={() => setMobileOpen(false)} />

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
