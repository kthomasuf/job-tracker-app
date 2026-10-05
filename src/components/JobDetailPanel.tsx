"use client";

import type { Job, Status } from "@/lib/types";
import { STATUS_NAMES, STATUS_STYLES } from "@/lib/statuses";
import { formatDate } from "@/lib/format";
import { JobMap } from "./JobMap";

interface JobDetailPanelProps {
  job: Job | undefined;
  drawer: boolean;
  showMap: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Status) => void;
  onNotesChange: (notes: string) => void;
}

export function JobDetailPanel({
  job,
  drawer,
  showMap,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onNotesChange,
}: JobDetailPanelProps) {
  if (!job) {
    return drawer ? null : (
      <div className="px-6 py-16 text-center text-sm text-[var(--muted)]">Select a job to see details.</div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] text-[var(--muted)]">{job.company}</div>
          <div className="text-[22px] font-semibold leading-tight tracking-tight">{job.role}</div>
          <div className="mt-1.5 flex items-center gap-2 text-[13px] text-[var(--muted-dark)]">
            <span>{job.location}</span>
            <span className="rounded border border-[var(--border-strong)] px-1.5 py-0 font-mono text-[11px] uppercase">
              {job.workMode}
            </span>
          </div>
        </div>
        <div className="flex gap-1.5">
          {drawer && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="cursor-pointer rounded-md border border-[var(--border-strong)] bg-white px-2.5 py-1.5 text-[13px] hover:bg-[#f1efea]"
            >
              ✕
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="cursor-pointer rounded-md border border-[var(--border-strong)] bg-white px-2.5 py-1.5 text-[13px] hover:bg-[#f1efea]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="cursor-pointer rounded-md border border-[var(--border-strong)] bg-white px-2.5 py-1.5 text-[13px] hover:bg-[#f1efea]"
            style={{ color: "oklch(0.5 0.15 25)" }}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {STATUS_NAMES.map((n) => {
          const active = job.status === n;
          const style = STATUS_STYLES[n];
          return (
            <button
              key={n}
              type="button"
              onClick={() => onStatusChange(n)}
              className="flex-1 cursor-pointer rounded-md px-2.5 py-1.5 text-[13px] font-medium"
              style={{
                border: `1px solid ${active ? style.dot : "var(--border-strong)"}`,
                background: active ? style.bg : "#fff",
                color: active ? style.fg : "var(--muted-dark)",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>

      {showMap && <JobMap job={job} />}

      <dl className="m-0 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-5 gap-y-4">
        <div>
          <dt className="mb-0.5 text-xs text-[var(--muted)]">Salary</dt>
          <dd className="m-0 text-sm">{job.salary || "—"}</dd>
        </div>
        <div>
          <dt className="mb-0.5 text-xs text-[var(--muted)]">Applied</dt>
          <dd className="m-0 text-sm">{formatDate(job.date)}</dd>
        </div>
        <div>
          <dt className="mb-0.5 text-xs text-[var(--muted)]">Posting</dt>
          <dd className="m-0 text-sm">
            {job.link ? (
              <a href={job.link} target="_blank" rel="noopener">
                View listing ↗
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>

      <div>
        <div className="mb-1.5 text-xs text-[var(--muted)]">Job description</div>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#3a3833]">
          {job.description || "No description added."}
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-xs text-[var(--muted)]">Notes</div>
        <textarea
          value={job.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={4}
          placeholder="Add notes…"
          className="w-full resize-y rounded-md border border-[var(--border-strong)] bg-white px-2.5 py-2 text-sm leading-relaxed outline-none"
        />
      </div>
    </div>
  );
}
