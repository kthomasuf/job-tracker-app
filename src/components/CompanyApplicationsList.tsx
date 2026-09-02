"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { APPLICATION_STATUSES, type Application } from "@/lib/types";
import { statusPillStyle } from "@/lib/status-styles";

export default function CompanyApplicationsList({
  applications,
}: {
  applications: Application[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function updateStatus(id: number, status: string) {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <ul className="flex flex-col gap-3">
      {applications.map((app) => (
        <li
          key={app.id}
          className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line-row)] pb-3 last:border-0 last:pb-0"
        >
          <div>
            <div className="font-medium text-[var(--text)]">{app.role}</div>
            <div className="text-sm text-[var(--text-secondary)]">
              {app.location} · Applied {new Date(app.dateApplied).toLocaleDateString()}
            </div>
          </div>
          <select
            value={app.status}
            disabled={isPending}
            onChange={(e) => updateStatus(app.id, e.target.value)}
            className="rounded-full border-0 px-3 py-1 text-xs font-medium"
            style={statusPillStyle(app.status)}
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status} className="text-[var(--text)]">
                {status}
              </option>
            ))}
          </select>
        </li>
      ))}
    </ul>
  );
}
