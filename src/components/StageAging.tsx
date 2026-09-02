export type StageAgingRow = {
  label: string;
  days: number;
  stalled: boolean;
};

type StageAgingProps = {
  rows: StageAgingRow[];
  nudgeCount: number;
};

export default function StageAging({ rows, nudgeCount }: StageAgingProps) {
  const maxDays = Math.max(1, ...rows.map((r) => r.days));

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-[var(--divider)] pt-4">
      <div className="flex items-center justify-between text-sm">
        <h3 className="font-semibold text-[var(--text)]">Stage aging</h3>
        <span className="text-xs text-[var(--text-muted)]">
          Avg. days sitting in stage
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">No applications yet.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((row) => {
            const pct = Math.min((row.days / maxDays) * 100, 100);
            return (
              <li key={row.label} className="flex items-center gap-3 text-sm">
                <span className="flex w-28 shrink-0 items-center gap-1.5 text-[var(--text-body)]">
                  {row.label}
                  {row.stalled && (
                    <span className="rounded-full bg-[var(--reject-wash)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--reject-text)]">
                      Stalled
                    </span>
                  )}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--track)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: row.stalled ? "var(--reject)" : "var(--accent)",
                    }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-[var(--text-muted)]">
                  {row.days}d
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {nudgeCount > 0 && (
        <p className="text-xs text-[var(--text-muted)]">
          {nudgeCount} application{nudgeCount === 1 ? "" : "s"} past the 14-day
          follow-up mark — worth a nudge.
        </p>
      )}
    </div>
  );
}
