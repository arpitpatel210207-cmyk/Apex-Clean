"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { Sidebar, SidebarContent } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuMotion = "duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

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
                <Topbar onMenuToggle={() => setMobileOpen(prev => !prev)} isMenuOpen={mobileOpen} />
                <div className="px-3 pb-4 pt-2 sm:px-4 sm:pb-5 lg:px-6 lg:pb-6">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity ${mobileMenuMotion} ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-[radial-gradient(120%_100%_at_20%_10%,rgba(26,36,44,0.45),rgba(8,12,16,0.72))] backdrop-blur-lg backdrop-saturate-150 transition-opacity ${mobileMenuMotion} ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />

        <div
          id="mobile-sidebar-drawer"
          className={`fixed inset-y-0 left-0 w-[286px] border-r border-white/10 bg-bg p-1 shadow-[0_26px_60px_rgba(0,0,0,0.6)] will-change-transform transform transition-[transform,opacity] ${mobileMenuMotion} ${
            mobileOpen ? "translate-x-0 opacity-100" : "-translate-x-[104%] opacity-70"
          }`}
        >
          <div className="mb-2 flex items-center justify-between px-3 pt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9cb5c2]">Navigation</p>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-[rgba(255,255,255,0.03)] text-[#d8ebf2] transition hover:bg-[rgba(255,255,255,0.08)]"
            >
              <X size={16} />
            </button>
          </div>
          <SidebarContent compact expanded mobileDrawerMode mobileDrawerOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>
    </>
  );
}
