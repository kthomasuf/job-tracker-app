import { prisma } from "@/lib/prisma";
import ApplicationsTable from "@/components/ApplicationsTable";
import PipelineDiagram from "@/components/PipelineDiagram";
import WeeklyMomentum, { type WeekBucket } from "@/components/WeeklyMomentum";
import StillInPlay from "@/components/StillInPlay";
import StageAging, { type StageAgingRow } from "@/components/StageAging";
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationStatus,
} from "@/lib/types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const STALL_THRESHOLD_DAYS = 14;

function daysSince(date: Date | string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / MS_PER_DAY);
}

export const dynamic = "force-dynamic";

const CARD_BASE =
  "rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm";
const CARD = `${CARD_BASE} p-5`;
const STAT_CARD = `${CARD_BASE} p-5`;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function startOfWeek(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + mondayOffset);
  return start;
}

function buildWeeklyMomentum(applications: Application[], weekCount = 8): WeekBucket[] {
  const currentWeekStart = startOfWeek(new Date()).getTime();

  const buckets = Array.from({ length: weekCount }, (_, i) => ({
    start: currentWeekStart - (weekCount - 1 - i) * WEEK_MS,
    sent: 0,
    replies: 0,
    interviews: 0,
  }));

  for (const app of applications) {
    const weekStart = startOfWeek(new Date(app.dateApplied)).getTime();
    const bucket = buckets.find((b) => b.start === weekStart);
    if (!bucket) continue;
    bucket.sent += 1;
    if (app.status !== "Applied") bucket.replies += 1;
    if (app.status === "Interviewing" || app.status === "Offer" || app.status === "Awaiting")
      bucket.interviews += 1;
  }

  return buckets.map((bucket, i) => ({
    label:
      i === buckets.length - 1
        ? "This wk"
        : new Date(bucket.start).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
          }),
    sent: bucket.sent,
    replies: bucket.replies,
    interviews: bucket.interviews,
  }));
}

type SearchParams = { searchParams: Promise<{ q?: string }> };

export default async function DashboardPage({ searchParams }: SearchParams) {
  const { q } = await searchParams;

  const applications = await prisma.application.findMany({
    orderBy: { dateApplied: "desc" },
  });

  const query = (q ?? "").trim().toLowerCase();
  const visibleApplications = query
    ? applications.filter(
        (a) =>
          a.company.toLowerCase().includes(query) ||
          a.role.toLowerCase().includes(query) ||
          a.location.toLowerCase().includes(query),
      )
    : applications;

  const total = applications.length;

  const counts = Object.fromEntries(
    APPLICATION_STATUSES.map((status) => [
      status,
      applications.filter((a) => a.status === status).length,
    ]),
  ) as Record<ApplicationStatus, number>;

  const appliedOnly = counts.Applied;
  const interviews = counts.Interviewing;
  const offers = counts.Offer;
  const rejections = counts.Rejected;
  const responses = total - appliedOnly;

  const responseRate = total > 0 ? Math.round((responses / total) * 100) : 0;
  const rejectionShare = total > 0 ? Math.round((rejections / total) * 100) : 0;
  const noResponseShare = total > 0 ? Math.round((appliedOnly / total) * 100) : 0;
  const earliestDate = applications.at(-1)?.dateApplied;
  const weeklyMomentum = buildWeeklyMomentum(applications);

  const OPEN_STATUSES: ApplicationStatus[] = ["Applied", "Screening", "Interviewing", "Awaiting"];
  const openApplications = applications.filter((a) =>
    OPEN_STATUSES.includes(a.status as ApplicationStatus),
  );
  const closedCount = offers + rejections;

  const STAGE_DEPTH: ApplicationStatus[] = ["Applied", "Screening", "Interviewing", "Awaiting", "Offer"];
  const furthestStage = [...STAGE_DEPTH].reverse().reduce<{ label: string; count: number }>(
    (found, status) => (found.count > 0 ? found : { label: status, count: counts[status] }),
    { label: "—", count: 0 },
  );

  const oldestOpenDays =
    openApplications.length > 0
      ? Math.max(...openApplications.map((a) => daysSince(a.dateApplied)))
      : null;

  const STAGE_AGING_STATUSES: ApplicationStatus[] = [
    "Applied",
    "Screening",
    "Interviewing",
    "Offer",
    "Awaiting",
  ];
  const stageAgingRows: StageAgingRow[] = STAGE_AGING_STATUSES.map(
    (status): StageAgingRow | null => {
      const inStage = applications.filter((a) => a.status === status);
      if (inStage.length === 0) return null;
      const avgDays = Math.round(
        inStage.reduce((sum, a) => sum + daysSince(a.updatedAt), 0) / inStage.length,
      );
      return { label: status, days: avgDays, stalled: avgDays > STALL_THRESHOLD_DAYS };
    },
  ).filter((row): row is StageAgingRow => row !== null);

  const nudgeCount = applications.filter(
    (a) =>
      OPEN_STATUSES.includes(a.status as ApplicationStatus) &&
      daysSince(a.updatedAt) > STALL_THRESHOLD_DAYS,
  ).length;

  const stats = [
    {
      label: "Applications Sent",
      value: total,
      caption: earliestDate
        ? `since ${new Date(earliestDate).toLocaleDateString()}`
        : "no applications yet",
    },
    { label: "Interviews", value: interviews, caption: "in interview stage" },
    { label: "Offers", value: offers, caption: "offers received" },
    { label: "Rejections", value: rejections, caption: `${rejectionShare}% of total` },
    { label: "No Response", value: appliedOnly, caption: `${noResponseShare}% of total` },
    {
      label: "Response Rate",
      value: `${responseRate}%`,
      caption: `${responses} of ${total} replied`,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {total} application{total === 1 ? "" : "s"} tracked
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={STAT_CARD}>
            <div className="text-xs uppercase tracking-wide text-[var(--text-eyebrow)]">
              {stat.label}
            </div>
            <div className="mt-1 text-2xl font-semibold text-[var(--text)]">
              {stat.value}
            </div>
            <div className="mt-1 text-xs text-[var(--text-muted)]">
              {stat.caption}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr] lg:items-stretch">
        <div className={CARD}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--text)]">Pipeline by stage</h2>
            <span className="text-xs text-[var(--text-muted)]">All time</span>
          </div>
          <PipelineDiagram total={total} counts={counts} />
          <StillInPlay
            open={openApplications.length}
            closed={closedCount}
            furthestStageLabel={furthestStage.label}
            furthestStageCount={furthestStage.count}
            oldestOpenDays={oldestOpenDays}
          />
        </div>

        <div className={CARD}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--text)]">Weekly momentum</h2>
          </div>
          <WeeklyMomentum weeks={weeklyMomentum} />
          <StageAging rows={stageAgingRows} nudgeCount={nudgeCount} />
        </div>
      </div>

      <ApplicationsTable applications={visibleApplications} />
    </div>
  );
}
