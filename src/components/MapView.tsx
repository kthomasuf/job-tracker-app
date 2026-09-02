"use client";

import { useState } from "react";
import type { Application } from "@/lib/types";
import JobMap from "./JobMapWrapper";
import JobSidebar from "./JobSidebar";

export default function MapView({
  applications,
}: {
  applications: Application[];
}) {
  const [selected, setSelected] = useState<Application | null>(null);

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      <div className="min-h-0 min-w-0 flex-1">
        <JobMap applications={applications} onViewProfile={setSelected} />
      </div>
      {selected && (
        <JobSidebar application={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
