"use client";

import { Bell, Menu, UserCircle2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const profileWrapRef = useRef<HTMLDivElement | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isProfileClosing, setIsProfileClosing] = useState(false);
  const profile = {
    name: "Rashi Shah",
    email: "rashi@example.com",
  };
  const initials = useMemo(
    () =>
      profile.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? "")
        .join(""),
    [profile.name]
  );

  const title = useMemo(() => {
    const map: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/dashboard/admin": "Admins",
      "/dashboard/scan-history": "Scan History",
      "/dashboard/voice-scan": "Voice Scan",
      "/dashboard/track-users": "Track Users",
      "/dashboard/about-us": "About Us",
      "/dashboard/live-scan/telegram": "Telegram Tracking",
      "/dashboard/live-scan/discord": "Discord Surveillance",
      "/dashboard/live-scan/4chan": "4chan Monitoring",
    };

    if (map[pathname]) return map[pathname];
    if (pathname.startsWith("/dashboard/geo/")) return "Geographic Activity";
    return "Dashboard";
  }, [pathname]);

  useEffect(() => {
    if (!isProfileOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!profileWrapRef.current?.contains(target)) {
        setIsProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsProfileOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileOpen]);

  function handleProfileToggle() {
    if (isProfileOpen) {
      setIsProfileOpen(false);
      setIsProfileClosing(true);
      return;
    }
    setIsProfileVisible(true);
    setIsProfileClosing(false);
    setIsProfileOpen(true);
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    setIsProfileOpen(false);
    setIsProfileClosing(true);
    toast.success("Logged out");
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-[120] border-b border-white/10 bg-white/[0.03] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/[0.02]">
      <div className="flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="topbar-glass-action rounded-lg p-2 text-[#e6f5fa] transition lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <h1 className="topbar-title m-0 truncate text-[#e6f5fa] text-2xl sm:text-3xl lg:text-[34px]">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Notifications"
            onClick={() => toast.info("No new notifications")}
            className="topbar-glass-action grid h-10 w-10 self-center place-items-center rounded-full text-[#e6f5fa] transition"
          >
            <Bell size={18} />
          </button>
          <div ref={profileWrapRef} className="relative">
            <button
              aria-label="User"
              aria-haspopup="menu"
              aria-expanded={isProfileOpen}
              onClick={handleProfileToggle}
              className="topbar-glass-action grid h-10 w-10 self-center place-items-center rounded-full text-[#e6f5fa] transition"
            >
              <UserCircle2 size={19} />
            </button>

            {isProfileVisible ? (
              <div
                role="menu"
                onAnimationEnd={() => {
                  if (!isProfileOpen) {
                    setIsProfileVisible(false);
                    setIsProfileClosing(false);
                  }
                }}
                className={`topbar-profile-card absolute right-0 top-[calc(100%+8px)] z-[300] w-[278px] origin-top-right rounded-2xl p-3.5 ${
                  isProfileOpen && !isProfileClosing ? "animate-profile-card-in" : "animate-profile-card-out"
                }`}
              >
                <p className="topbar-profile-label">ACCOUNT</p>

                <div className="topbar-profile-head">
                  <div className="topbar-profile-avatar" aria-hidden="true">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#e6f5fa]">{profile.name}</p>
                    <p className="truncate text-[13px] text-[#a9c5d0]">{profile.email}</p>
                  </div>
                </div>

                <div className="topbar-profile-status">
                  <span className="topbar-profile-status-dot" aria-hidden="true" />
                  Secure session active
                </div>

                <button
                  onClick={handleLogout}
                  className="topbar-profile-logout mt-3 w-full rounded-xl px-4 py-2 text-sm font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
