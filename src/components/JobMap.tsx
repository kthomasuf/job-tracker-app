"use client";

import type { Job } from "@/lib/types";

interface JobMapProps {
  job: Job;
}

export function JobMap({ job }: JobMapProps) {
  const hasCoords = job.lat != null && job.lon != null;
  const message =
    job.workMode === "Remote" || /remote/i.test(job.location) ? "Remote — no location" : "No location on map";

  const d = 0.06;
  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${job.lon! - d},${job.lat! - d * 0.6},${job.lon! + d},${job.lat! + d * 0.6}&layer=mapnik&marker=${job.lat},${job.lon}`
    : "";

  return (
    <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[#ecebe6]">
      {hasCoords ? (
        <iframe src={mapSrc} title="Map" className="block h-full w-full border-0" />
      ) : (
        <div className="font-mono text-xs text-[var(--muted)]">{message}</div>
      )}
    </div>
  );
}
