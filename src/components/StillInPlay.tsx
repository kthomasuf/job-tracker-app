type StillInPlayProps = {
  open: number;
  closed: number;
  furthestStageLabel: string;
  furthestStageCount: number;
  oldestOpenDays: number | null;
};

export default function StillInPlay({
  open,
  closed,
  furthestStageLabel,
  furthestStageCount,
  oldestOpenDays,
}: StillInPlayProps) {
  const total = open + closed;
  const openPct = total > 0 ? Math.round((open / total) * 100) : 0;

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-[var(--divider)] pt-4">
      <div className="flex items-center justify-between text-sm">
        <h3 className="font-semibold text-[var(--text)]">Still in play</h3>
        <span className="text-xs text-[var(--text-muted)]">
          {open} of {total} open
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--track)]">
        <div
          className="h-full rounded-full bg-[var(--accent)]"
          style={{ width: `${openPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>{openPct}% open</span>
        <span>{closed} closed out</span>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--text-eyebrow)]">
            Furthest stage
          </div>
          <div className="text-base font-semibold text-[var(--text)]">
            {furthestStageCount > 0
              ? `${furthestStageLabel} ×${furthestStageCount}`
              : "—"}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--text-eyebrow)]">
            Oldest open
          </div>
          <div className="text-base font-semibold text-[var(--text)]">
            {oldestOpenDays !== null ? `${oldestOpenDays}d` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
