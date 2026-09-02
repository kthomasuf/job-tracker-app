import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { COST_OF_LIVING_SAMPLE } from "@/lib/cost-of-living";
import JobMap from "@/components/JobMapWrapper";
import CompanyApplicationsList from "@/components/CompanyApplicationsList";
import CompanyNotes from "@/components/CompanyNotes";

export const dynamic = "force-dynamic";

const CARD =
  "flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm";

function costOfLivingFor(location: string) {
  return COST_OF_LIVING_SAMPLE.find(
    (c) => c.location.toLowerCase() === location.toLowerCase(),
  );
}

type Params = { params: Promise<{ company: string }> };

export default async function CompanyProfilePage({ params }: Params) {
  const { company: companyParam } = await params;
  const company = decodeURIComponent(companyParam);

  const applications = await prisma.application.findMany({
    where: { company },
    orderBy: { dateApplied: "desc" },
  });

  if (applications.length === 0) notFound();

  const companyNote = await prisma.companyNote.findUnique({ where: { company } });

  const OPEN_STATUSES = new Set(["Applied", "Screening", "Interviewing", "Awaiting"]);
  const openCount = applications.filter((a) => OPEN_STATUSES.has(a.status)).length;
  const closedCount = applications.length - openCount;
  const lastActivity = applications.reduce(
    (latest, a) => (a.updatedAt > latest ? a.updatedAt : latest),
    applications[0].updatedAt,
  );

  const locations = [
    ...new Map(
      applications.map((a) => [a.location, { location: a.location, lat: a.lat, lng: a.lng }]),
    ).values(),
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text)]"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--text)]">{company}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {applications.length} application{applications.length === 1 ? "" : "s"} tracked
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className={CARD}>
          <div className="text-xs uppercase tracking-wide text-[var(--text-eyebrow)]">
            Applications
          </div>
          <div className="mt-1 text-2xl font-semibold text-[var(--text)]">
            {applications.length}
          </div>
        </div>
        <div className={CARD}>
          <div className="text-xs uppercase tracking-wide text-[var(--text-eyebrow)]">
            Open
          </div>
          <div className="mt-1 text-2xl font-semibold text-[var(--text)]">{openCount}</div>
        </div>
        <div className={CARD}>
          <div className="text-xs uppercase tracking-wide text-[var(--text-eyebrow)]">
            Closed
          </div>
          <div className="mt-1 text-2xl font-semibold text-[var(--text)]">{closedCount}</div>
        </div>
        <div className={CARD}>
          <div className="text-xs uppercase tracking-wide text-[var(--text-eyebrow)]">
            Last activity
          </div>
          <div className="mt-1 text-2xl font-semibold text-[var(--text)]">
            {new Date(lastActivity).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
        <div className={CARD}>
          <h2 className="mb-4 text-base font-semibold text-[var(--text)]">Applications</h2>
          <CompanyApplicationsList applications={applications} />
        </div>

        <div className={CARD}>
          <h2 className="mb-4 text-base font-semibold text-[var(--text)]">Locations</h2>
          <ul className="flex flex-col gap-3">
            {locations.map((loc) => {
              const col = costOfLivingFor(loc.location);
              return (
                <li key={loc.location} className="text-sm">
                  <div className="font-medium text-[var(--text)]">{loc.location}</div>
                  {col && (
                    <div className="text-[var(--text-muted)]">
                      Cost of living index: {col.index} (sample data)
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <CompanyNotes company={company} initialNotes={companyNote?.notes ?? ""} />

        <div className={CARD}>
          <h2 className="mb-4 text-base font-semibold text-[var(--text)]">Map</h2>
          <div className="min-h-[320px] flex-1">
            <JobMap applications={applications} />
          </div>
        </div>
      </div>
    </div>
  );
}
