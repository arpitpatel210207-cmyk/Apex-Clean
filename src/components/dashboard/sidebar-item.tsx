import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDEBAR_MOTION = "duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

export function NavItem({
  href,
  icon,
  label,
  onClick,
  compact = false,
  expanded = false,
}: {
  href: string;
  icon?: React.ReactNode;

  label: string;
  onClick?: () => void;
  compact?: boolean;
  expanded?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  const detailDelay = expanded ? "80ms" : "0ms";

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center border border-transparent will-change-transform transition-[background-color,color,box-shadow,border-color] ${SIDEBAR_MOTION} ${
        compact ? "w-full rounded-xl pl-3.5 pr-2.5 py-2.5" : "gap-3 rounded-md px-3 py-2"
      } ${
        active
          ? "bg-[rgba(28,32,34,0.95)] text-[#e6f5fa] font-semibold border-[rgba(230,245,250,0.28)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.35)]"
          : "text-[#e6f5fa] hover:bg-card2 hover:text-[#e6f5fa] hover:border-[rgba(255,255,255,0.05)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-1 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-full transition-opacity ${SIDEBAR_MOTION} ${
          active ? "bg-[#e6f5fa] opacity-100" : "opacity-0"
        }`}
      />
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-[11px] border border-[rgba(0,0,0,0.78)] bg-[rgb(12,12,12)] shadow-[inset_5px_5px_10px_rgba(0,0,0,0.84),inset_-2px_-2px_5px_rgba(255,255,255,0.08),0_1px_0_rgba(0,0,0,0.6)] transition-[color,background-color,border-color,box-shadow] ${SIDEBAR_MOTION} ${
          active
            ? "text-[#e6f5fa] border-[rgba(230,245,250,0.3)] bg-[rgb(10,10,10)] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.9),inset_-2px_-2px_6px_rgba(255,255,255,0.11)]"
            : "text-[#e6f5fa] group-hover:text-[#e6f5fa] group-hover:border-[rgba(0,0,0,0.82)] group-hover:bg-[rgb(10,10,10)] group-hover:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.88),inset_-2px_-2px_6px_rgba(255,255,255,0.1),0_1px_0_rgba(0,0,0,0.68)]"
        }`}
      >
        {icon}
      </span>
      {compact ? (
        <span
          className={`overflow-hidden whitespace-nowrap text-sm will-change-[width,opacity,transform] transition-[width,opacity,transform,margin] ${SIDEBAR_MOTION} ${
            expanded
              ? "ml-3 w-[160px] translate-x-0 opacity-100"
              : "ml-0 w-0 translate-x-1 opacity-0"
          }`}
          style={{ transitionDelay: detailDelay }}
        >
          {label}
        </span>
      ) : (
        <span>{label}</span>
      )}
    </Link>
  );
}
