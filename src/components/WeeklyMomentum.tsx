export type WeekBucket = {
  label: string;
  sent: number;
  replies: number;
  interviews: number;
};

const SERIES = [
  { key: "sent", label: "Sent", color: "var(--ramp-1)" },
  { key: "replies", label: "Replies", color: "var(--ramp-3)" },
  { key: "interviews", label: "Interviews", color: "var(--ramp-5)" },
] as const;

const MAX_BAR_HEIGHT = 96;

export default function WeeklyMomentum({ weeks }: { weeks: WeekBucket[] }) {
  const max = Math.max(1, ...weeks.flatMap((w) => [w.sent, w.replies, w.interviews]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-4 text-xs text-[var(--text-secondary)]">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            {s.label}
          </span>
        ))}
      </div>

      <div className="flex items-end justify-between gap-2">
        {weeks.map((week) => (
          <div key={week.label} className="flex flex-col items-center gap-2">
            <div
              className="flex items-end gap-1"
              style={{ height: MAX_BAR_HEIGHT }}
            >
              {SERIES.map((s) => {
                const value = week[s.key];
                const height =
                  value > 0 ? Math.max((value / max) * MAX_BAR_HEIGHT, 3) : 0;
                return (
                  <div
                    key={s.key}
                    className="w-2.5 rounded-t-sm"
                    style={{ height, backgroundColor: s.color }}
                    title={`${s.label}: ${value}`}
                  />
                );
              })}
            </div>
            <span className="whitespace-nowrap text-xs text-[var(--text-muted)]">
              {week.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
