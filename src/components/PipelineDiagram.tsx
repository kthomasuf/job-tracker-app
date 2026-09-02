import { type ApplicationStatus } from "@/lib/types";

type PipelineDiagramProps = {
  total: number;
  counts: Record<ApplicationStatus, number>;
};

const SEGMENTS: { key: ApplicationStatus; label: string; color: string }[] = [
  { key: "Applied", label: "Applied", color: "var(--status-applied)" },
  { key: "Screening", label: "Screening", color: "var(--status-screening)" },
  { key: "Interviewing", label: "Interviewing", color: "var(--status-interviewing)" },
  { key: "Offer", label: "Offer", color: "var(--status-offer)" },
  { key: "Awaiting", label: "Awaiting", color: "var(--status-awaiting)" },
  { key: "Rejected", label: "Rejected", color: "var(--status-rejected)" },
];

const VIEWBOX_SIZE = 200;
const CENTER = VIEWBOX_SIZE / 2;
const RADIUS = 78;
const STROKE_WIDTH = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// Arc-length gap between segments, in the same units as CIRCUMFERENCE.
// Converted to an angle below so every gap — including the one where the
// ring wraps back around to the first segment — is drawn identically.
const SEGMENT_GAP = 6;
const TAU = Math.PI * 2;
const FULL_CIRCLE_EPSILON = 0.0001;

function pointOnCircle(angle: number) {
  return {
    x: CENTER + RADIUS * Math.sin(angle),
    y: CENTER - RADIUS * Math.cos(angle),
  };
}

function arcPath(startAngle: number, endAngle: number) {
  const start = pointOnCircle(startAngle);
  const end = pointOnCircle(endAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export default function PipelineDiagram({ total, counts }: PipelineDiagramProps) {
  const segments = SEGMENTS.map((s) => ({ ...s, value: counts[s.key] ?? 0 }));

  const nonZeroCount = segments.filter((s) => s.value > 0).length;
  const gapAngle = nonZeroCount > 1 && total > 0 ? (SEGMENT_GAP / CIRCUMFERENCE) * TAU : 0;

  const sweeps = segments.map((s) => (total > 0 ? (s.value / total) * TAU : 0));
  const arcs = segments.map((segment, i) => {
    const sweep = sweeps[i];
    const startAngle = sweeps.slice(0, i).reduce((sum, v) => sum + v, 0);
    const endAngle = Math.max(startAngle + sweep - gapAngle, startAngle);
    return { ...segment, startAngle, endAngle };
  });

  return (
    <div className="flex flex-row items-center gap-6">
      <div className="relative h-[260px] w-[260px] shrink-0">
        <svg
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
          className="h-full w-full"
          role="img"
          aria-label={`${total} applications sent, broken down by status`}
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={total > 0 ? "var(--surface)" : "var(--track)"}
            strokeWidth={STROKE_WIDTH}
          />
          {arcs.map((arc) => {
            if (arc.value <= 0) return null;
            const isFullCircle = arc.endAngle - arc.startAngle >= TAU - FULL_CIRCLE_EPSILON;
            return isFullCircle ? (
              <circle
                key={arc.key}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE_WIDTH}
              >
                <title>
                  {arc.label}: {arc.value} of {total}
                </title>
              </circle>
            ) : (
              <path
                key={arc.key}
                d={arcPath(arc.startAngle, arc.endAngle)}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="butt"
              >
                <title>
                  {arc.label}: {arc.value} of {total}
                </title>
              </path>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-semibold text-[var(--text)]">{total}</span>
          <span className="text-xs uppercase tracking-wide text-[var(--text-eyebrow)]">
            Total
          </span>
        </div>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
        {segments.map((segment) => (
          <li
            key={segment.key}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: segment.color }}
                aria-hidden="true"
              />
              <span className="text-[var(--text-body)]">{segment.label}</span>
            </span>
            <span className="font-semibold text-[var(--text)]">{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
