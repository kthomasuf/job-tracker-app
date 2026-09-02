"use client";

import type { Application } from "@/lib/types";

export default function JobSidebar({
  application,
  onClose,
}: {
  application: Application;
  onClose: () => void;
}) {
  return (
    <aside className="flex h-full w-full shrink-0 flex-col gap-5 overflow-y-auto rounded-lg border border-[var(--border)] p-6 lg:w-[32rem] xl:w-[40rem]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-[var(--text)]">
            {application.role}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {application.company}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-[var(--text-secondary)] hover:text-[var(--text)]"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-1 text-sm text-[var(--text-body)]">
        <div>Status: {application.status}</div>
        <div>
          Applied: {new Date(application.dateApplied).toLocaleDateString()}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--divider)] pt-4 text-sm text-[var(--text-secondary)]">
        <p className="italic">
          Placeholder — profile detail view isn&apos;t built out yet.
        </p>
        <div>
          <div className="font-medium text-[var(--text)]">Job Description</div>
          <p>
            Placeholder description of the role, responsibilities, and
            requirements would go here.
          </p>
        </div>
        <div>
          <div className="font-medium text-[var(--text)]">Salary Range</div>
          <p>Placeholder</p>
        </div>
        <div>
          <div className="font-medium text-[var(--text)]">Notes</div>
          <p>No notes yet.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-[var(--divider)] pt-4 text-sm text-[var(--text-secondary)]">
        <div className="font-medium text-[var(--text)]">Location</div>
        <p>{application.location}</p>
        <p>Neighborhood: Placeholder</p>
        <p>Cost of living index: Placeholder</p>
        <p>Commute: Placeholder</p>
      </div>
    </aside>
  );
}
