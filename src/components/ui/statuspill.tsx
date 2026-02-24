export type Status =
  | "success"
  | "danger"
  | "up"
  | "down"
  | "alert"
  | "draft"
  | "submitted"
  | "approved"
  | "denied"
  | "cancelled";

const STYLES = {
  draft: {
    background: "rgb(71 85 105 / 0.15)",
    border: "rgb(71 85 105 / 0.5)",
    color: "rgb(148 163 184)",
  },
  submitted: {
    background: "rgb(59 130 246 / 0.1)",
    border: "rgb(59 130 246 / 0.4)",
    color: "rgb(147 197 253)",
  },
  approved: {
    background: "rgb(34 197 94 / 0.12)",
    border: "rgb(34 197 94 / 0.45)",
    color: "rgb(74 222 128)",
  },
  denied: {
    background: "rgb(239 68 68 / 0.12)",
    border: "rgb(239 68 68 / 0.45)",
    color: "rgb(248 113 113)",
  },
  cancelled: {
    background: "rgb(249 115 22 / 0.12)",
    border: "rgb(249 115 22 / 0.45)",
    color: "rgb(253 186 116)",
  },
  success: {
    background: "rgb(34 197 94 / 0.12)",
    border: "rgb(34 197 94 / 0.45)",
    color: "rgb(74 222 128)",
  },
  danger: {
    background: "rgb(239 68 68 / 0.12)",
    border: "rgb(239 68 68 / 0.45)",
    color: "rgb(248 113 113)",
  },
  up: {
    background: "rgb(34 211 238 / 0.12)",
    border: "rgb(34 211 238 / 0.45)",
    color: "rgb(103 232 249)",
  },
  down: {
    background: "rgb(251 191 36 / 0.12)",
    border: "rgb(251 191 36 / 0.45)",
    color: "rgb(252 211 77)",
  },
  alert: {
    background: "rgb(244 63 94 / 0.12)",
    border: "rgb(244 63 94 / 0.45)",
    color: "rgb(253 164 175)",
  },
} as const;

type Props = {
  status: Status;
  label: string;
  className?: string;
};

export function StatusPill({ status, label, className = "" }: Props) {
  const style = STYLES[status] ?? STYLES.draft;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide ${className}`}
      style={{
        backgroundColor: style.background,
        borderColor: style.border,
        color: style.color,
      }}
    >
      {label}
    </span>
  );
}
