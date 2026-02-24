export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="page-heading">{title}</h2>
        {subtitle ? <p className="mt-1 text-[14px] text-mutetext">{subtitle}</p> : null}
      </div>
    </div>
  );
}
