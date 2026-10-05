"use client";

import type { Job, SortKey } from "@/lib/types";
import { STATUS_STYLES } from "@/lib/statuses";
import { formatDate } from "@/lib/format";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "company", label: "Company" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "location", label: "Location" },
  { key: "date", label: "Applied" },
];

interface ApplicationsTableProps {
  rows: Job[];
  sort: SortKey;
  dir: 1 | -1;
  onSort: (key: SortKey) => void;
  selId: number | null;
  onSelect: (id: number) => void;
}

export function ApplicationsTable({ rows, sort, dir, onSort, selId, onSelect }: ApplicationsTableProps) {
  return (
    <section className="min-w-0 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[var(--surface)] text-left">
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                onClick={() => onSort(c.key)}
                className="cursor-pointer whitespace-nowrap border-b border-[var(--border)] px-3.5 py-2.5 text-xs font-medium uppercase tracking-wide text-[var(--muted)] select-none"
              >
                {c.label} <span className="font-mono">{sort === c.key ? (dir > 0 ? "↑" : "↓") : ""}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const style = STATUS_STYLES[r.status];
            const selected = r.id === selId;
            return (
              <tr
                key={r.id}
                onClick={() => onSelect(r.id)}
                className="cursor-pointer hover:bg-[#efede8]"
                style={{
                  background: selected ? "#fff" : "transparent",
                  boxShadow: selected ? "inset 3px 0 0 var(--accent)" : "none",
                }}
              >
                <td className="border-b border-[#ebe9e4] px-3.5 py-3 font-medium">{r.company}</td>
                <td className="border-b border-[#ebe9e4] px-3.5 py-3">{r.role}</td>
                <td className="border-b border-[#ebe9e4] px-3.5 py-3">
                  <span
                    className="inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: style.bg, color: style.fg }}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="border-b border-[#ebe9e4] px-3.5 py-3 text-[var(--muted-dark)]">{r.location}</td>
                <td className="whitespace-nowrap border-b border-[#ebe9e4] px-3.5 py-3 font-mono text-xs text-[var(--muted-dark)]">
                  {formatDate(r.date)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="px-6 py-12 text-center text-sm text-[var(--muted)]">No jobs match.</div>
      )}
    </section>
  );
}
