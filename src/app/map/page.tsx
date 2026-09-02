import { prisma } from "@/lib/prisma";
import MapView from "@/components/MapView";
import { COST_OF_LIVING_SAMPLE } from "@/lib/cost-of-living";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const applications = await prisma.application.findMany({
    orderBy: { dateApplied: "desc" },
  });

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-[var(--text)]">Job Locations</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Colored dots are applications by status. Smaller dots show sample
          cost-of-living index per city (hardcoded for now). Click a job dot
          and use &quot;View Profile&quot; to open its details.
        </p>
      </div>

      <div className="min-h-0 flex-1">
        <MapView applications={applications} />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {COST_OF_LIVING_SAMPLE.map((c) => (
          <span key={c.location} className="text-[var(--text-secondary)]">
            {c.location}: COL {c.index}
          </span>
        ))}
      </div>
    </div>
  );
}
