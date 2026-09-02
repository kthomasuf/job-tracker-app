"use client";

import { useRouter } from "next/navigation";
import { Suspense, useMemo, useState, useTransition } from "react";
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationStatus,
} from "@/lib/types";
import { statusPillStyle } from "@/lib/status-styles";
import DashboardSearchBar from "@/components/DashboardSearchBar";
import AddJobModal from "@/components/AddJobModal";

const OPEN_STATUSES = new Set(["Applied", "Screening", "Interviewing", "Awaiting"]);

type Filter = "all" | "active" | "closed";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "closed", label: "Closed" },
];

type SortKey = "company" | "role" | "location" | "dateApplied" | "status";
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "company", label: "Company" },
  { key: "role", label: "Role" },
  { key: "status", label: "Stage" },
  { key: "location", label: "Location" },
  { key: "dateApplied", label: "Applied" },
];

function compareApps(a: Application, b: Application, key: SortKey): number {
  switch (key) {
    case "dateApplied":
      return new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime();
    case "status":
      return (
        APPLICATION_STATUSES.indexOf(a.status as ApplicationStatus) -
        APPLICATION_STATUSES.indexOf(b.status as ApplicationStatus)
      );
    default:
      return a[key].localeCompare(b[key]);
  }
}

export default function ApplicationsTable({
  applications,
}: {
  applications: Application[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<Filter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("dateApplied");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const activeCount = useMemo(
    () => applications.filter((a) => OPEN_STATUSES.has(a.status)).length,
    [applications],
  );

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "dateApplied" ? "desc" : "asc");
    }
  }

  const visible = applications
    .filter((a) => {
      if (filter === "active") return OPEN_STATUSES.has(a.status);
      if (filter === "closed") return !OPEN_STATUSES.has(a.status);
      return true;
    })
    .sort((a, b) => {
      const result = compareApps(a, b, sortKey);
      return sortDir === "asc" ? result : -result;
    });

  async function updateStatus(id: number, status: string) {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    startTransition(() => router.refresh());
  }

  async function remove(id: number) {
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="mb-4 grid grid-cols-1 items-center gap-3 sm:grid-cols-3">
        <h2 className="flex items-baseline gap-2 text-base font-semibold text-[var(--text)] sm:justify-self-start">
          Current jobs
          <span className="text-sm font-normal text-[var(--text-muted)]">
            {activeCount} active
          </span>
        </h2>

        <div className="flex gap-1 rounded-full border border-[var(--border)] p-0.5 text-sm sm:justify-self-center">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 transition-colors ${
                filter === f.key
                  ? "bg-[var(--track)] font-medium text-[var(--text)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:justify-self-end">
          <Suspense fallback={null}>
            <DashboardSearchBar />
          </Suspense>
          <AddJobModal />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">
          No applications in this view.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead className="border-b border-[var(--divider)] text-left">
              <tr>
                {COLUMNS.map((col) => (
                  <th key={col.key} className="whitespace-nowrap px-3 py-2">
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 text-xs uppercase tracking-wide text-[var(--text-eyebrow)] hover:text-[var(--text)]"
                    >
                      {col.label}
                      {sortKey === col.key && (
                        <span aria-hidden="true">
                          {sortDir === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                ))}
                <th className="whitespace-nowrap px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {visible.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => router.push(`/companies/${encodeURIComponent(app.company)}`)}
                  className="cursor-pointer border-b border-[var(--line-row)] last:border-0 hover:bg-[var(--surface-subtle)]"
                >
                  <td className="whitespace-nowrap px-3 py-2.5 font-medium text-[var(--text)]">
                    {app.company}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">{app.role}</td>
                  <td
                    onClick={(e) => e.stopPropagation()}
                    className="whitespace-nowrap px-3 py-2.5"
                  >
                    <select
                      value={app.status}
                      disabled={isPending}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className="rounded-full border-0 px-3 py-1 text-xs font-medium"
                      style={statusPillStyle(app.status)}
                    >
                      {APPLICATION_STATUSES.map((status) => (
                        <option
                          key={status}
                          value={status}
                          className="text-[var(--text)]"
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">{app.location}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {new Date(app.dateApplied).toLocaleDateString()}
                  </td>
                  <td
                    onClick={(e) => e.stopPropagation()}
                    className="whitespace-nowrap px-3 py-2.5"
                  >
                    <button
                      onClick={() => remove(app.id)}
                      disabled={isPending}
                      className="text-[var(--reject-text)] hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
