"use client";

import type { Job, Status } from "@/lib/types";
import { STATUS_NAMES, STATUS_STYLES } from "@/lib/statuses";

interface FilterBarProps {
  jobs: Job[];
  filter: "All" | Status;
  onFilterChange: (filter: "All" | Status) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export function FilterBar({ jobs, filter, onFilterChange, query, onQueryChange }: FilterBarProps) {
  const names: ("All" | Status)[] = ["All", ...STATUS_NAMES];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-6 py-3.5">
      {names.map((n) => {
        const count = n === "All" ? jobs.length : jobs.filter((j) => j.status === n).length;
        const active = filter === n;
        const dot = n === "All" ? "var(--foreground)" : STATUS_STYLES[n].dot;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onFilterChange(n)}
            className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-[13px]"
            style={{
              border: `1px solid ${active ? "var(--foreground)" : "var(--border-strong)"}`,
              background: active ? "#fff" : "transparent",
            }}
          >
            <span className="inline-block h-[7px] w-[7px] rounded-full" style={{ background: dot }} />
            <span>{n}</span>
            <span className="font-mono text-xs text-[var(--muted)]">{count}</span>
          </button>
        );
      })}
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search company, role, location…"
        className="ml-auto min-w-[220px] flex-[0_1_300px] rounded-md border border-[var(--border-strong)] bg-white px-2.5 py-1.5 text-[13px] outline-none"
      />
    </div>
  );
}
