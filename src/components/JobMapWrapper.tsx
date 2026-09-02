"use client";

import dynamic from "next/dynamic";

const JobMap = dynamic(() => import("./JobMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[300px] w-full items-center justify-center rounded-lg border border-[var(--border)] text-sm text-[var(--text-secondary)]">
      Loading map...
    </div>
  ),
});

export default JobMap;
