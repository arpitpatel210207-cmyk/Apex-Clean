"use client";

import { useState } from "react";
import { LogoMark } from "@/components/ui/logo";
import { usePathname } from "next/navigation";
import {
  Users,
  Radar,
  History,
  MapPin,
  Info,
  LayoutDashboard,
  Globe,
  Voicemail,
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { NavItem } from "@/components/dashboard/sidebar-item";

const SIDEBAR_MOTION = "duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

export function SidebarContent({
  onNavigate,
  compact = false,
  expanded = false,
}: {
  onNavigate?: () => void;
  compact?: boolean;
  expanded?: boolean;
}) {
  const pathname = usePathname();
  const liveScanActive = pathname.startsWith("/dashboard/live-scan");
  const [liveScanManuallyOpen, setLiveScanManuallyOpen] = useState(false);
  const detailDelay = expanded ? "80ms" : "0ms";
  const canShowSubmenu = !compact || expanded;
  const liveScanOpen = canShowSubmenu && liveScanManuallyOpen;

  function handleNavClick() {
    setLiveScanManuallyOpen(false);
    onNavigate?.();
  }

  return (
    <div
      className={`flex h-full min-h-0 w-full flex-col ${
        compact
          ? `rounded-[30px] border border-[rgba(230,245,250,0.2)] bg-[rgb(22,22,22)] pl-2 pr-1 py-3 shadow-[0_1px_0_rgba(255,255,255,0.05),0_10px_22px_rgba(0,0,0,0.44),inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-1px_0_rgba(0,0,0,0.36)] transition-[box-shadow,border-color,background-color] ${SIDEBAR_MOTION}`
          : "px-4 py-5"
      }`}
    >
      <div className={compact ? "mb-3 flex w-full items-center justify-start pl-1.5 pr-2.5" : "flex items-center gap-3 px-2"}>
        <LogoMark />
        <span
          className={`overflow-hidden whitespace-nowrap text-lg font-semibold tracking-[0.01em] text-[#e6f5fa] transition-[width,opacity,transform,margin] ${SIDEBAR_MOTION} ${
            !compact || expanded ? "ml-3 w-[160px] translate-x-0 opacity-100" : "ml-0 w-0 translate-x-1 opacity-0"
          }`}
          style={{ transitionDelay: detailDelay }}
        >
          Apex Clean
        </span>
      </div>

      <nav
        className={`${
          compact
            ? `mt-1 flex min-h-0 w-full flex-1 flex-col gap-1 pt-1 ${
                liveScanOpen ? "overflow-y-auto scrollbar-hide" : "overflow-hidden"
              }`
            : `${liveScanOpen ? "max-h-full overflow-y-auto scrollbar-hide" : ""} mt-8 space-y-2`
        } text-[#e6f5fa] text-[15px] font-medium`}
      >
       
        <NavItem href="/dashboard/admin" icon={<Users size={18} />} label="Admins" onClick={handleNavClick} compact={compact} expanded={expanded} />
         <NavItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={handleNavClick} compact={compact} expanded={expanded} />
        <div className="space-y-1">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setLiveScanManuallyOpen(prev => !prev)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setLiveScanManuallyOpen(prev => !prev);
              }
            }}
            aria-expanded={liveScanOpen}
            className={`group relative flex w-full items-center rounded-xl border border-transparent pl-3.5 pr-2.5 py-2.5 text-[#e6f5fa] will-change-transform transition-[background-color,color,box-shadow,border-color] ${SIDEBAR_MOTION} ${
              liveScanActive
                ? "bg-[rgba(28,32,34,0.95)] text-[#e6f5fa] font-semibold border-[rgba(230,245,250,0.28)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.35)]"
                : "hover:bg-card2 hover:text-[#e6f5fa]"
            }`}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] border border-[rgba(0,0,0,0.78)] bg-[rgb(12,12,12)] shadow-[inset_5px_5px_10px_rgba(0,0,0,0.84),inset_-2px_-2px_5px_rgba(255,255,255,0.08),0_1px_0_rgba(0,0,0,0.6)]">
              <Radar size={18} className="text-[#e6f5fa]" />
            </span>
            <span
              className={`overflow-hidden whitespace-nowrap text-sm will-change-[width,opacity,transform] transition-[width,opacity,transform,margin] ${SIDEBAR_MOTION} ${
                !compact || expanded
                  ? "ml-3 w-[132px] translate-x-0 opacity-100"
                  : "ml-0 w-0 translate-x-1 opacity-0"
              }`}
              style={{ transitionDelay: detailDelay }}
            >
              Live Scan
            </span>
            {canShowSubmenu ? (
              <span
                className={`ml-auto grid h-5 w-5 place-items-center text-[#e6f5fa] transition-transform ${SIDEBAR_MOTION} ${
                  liveScanOpen ? "rotate-0" : "-rotate-90"
                }`}
              >
                {liveScanOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            ) : null}
          </div>

          {canShowSubmenu ? (
            <div
              className={`overflow-hidden transition-[max-height,opacity,transform] ${SIDEBAR_MOTION} ${
                liveScanOpen ? "max-h-52 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1"
              }`}
            >
              <div className="mt-1 space-y-1 pl-2">
                <NavItem href="/dashboard/live-scan/telegram" icon={<Send size={18} />} label="Telegram" onClick={handleNavClick} compact={compact} expanded={expanded} />
                <NavItem href="/dashboard/live-scan/discord" icon={<MessageCircle size={18} />} label="Discord" onClick={handleNavClick} compact={compact} expanded={expanded} />
                <NavItem href="/dashboard/live-scan/reddit" icon={<Globe size={18} />} label="Reddit" onClick={handleNavClick} compact={compact} expanded={expanded} />
              </div>
            </div>
          ) : null}
        </div>
        <NavItem href="/dashboard/scan-history" icon={<History size={18} />} label="Scan History" onClick={handleNavClick} compact={compact} expanded={expanded} />
        <NavItem href="/dashboard/voice-scan" icon={<Voicemail size={18} />} label="Voice Scan" onClick={handleNavClick} compact={compact} expanded={expanded} />
        <NavItem href="/dashboard/track-users" icon={<MapPin size={18} />} label="Track Users" onClick={handleNavClick} compact={compact} expanded={expanded} />
        <NavItem href="/dashboard/geo/region" icon={<Globe size={18} />} label="Geographic Activity" onClick={handleNavClick} compact={compact} expanded={expanded} />
        <NavItem href="/dashboard/about-us" icon={<Info size={18} />} label="About Us" onClick={handleNavClick} compact={compact} expanded={expanded} />
      </nav>

    </div>
  );
}

export function Sidebar() {
  const expanded = true;

  return (
    <aside
      className={`sticky top-6 z-[320] h-[calc(100vh-3rem)] w-[248px] origin-left bg-bg p-1 will-change-[width,padding] transition-[width,padding] ${SIDEBAR_MOTION}`}
    >
      <SidebarContent compact expanded={expanded} />
    </aside>
  );
}
