"use client";

import type { FormEvent } from "react";
import type { JobFormData, WorkMode } from "@/lib/types";
import { STATUS_NAMES } from "@/lib/statuses";

interface JobFormModalProps {
  open: boolean;
  title: string;
  saveLabel: string;
  form: JobFormData;
  onChange: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const WORK_MODES: WorkMode[] = ["On-site", "Hybrid", "Remote"];

export function JobFormModal({ open, title, saveLabel, form, onChange, onSubmit, onClose }: JobFormModalProps) {
  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const fieldClass =
    "rounded-md border border-[var(--border-strong)] bg-white px-2.5 py-2 text-sm text-[var(--foreground)] outline-none";
  const labelClass = "flex flex-col gap-1 text-xs text-[var(--muted)]";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(29,28,26,0.35)] p-5"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex w-full max-w-[520px] flex-col gap-3.5 overflow-y-auto rounded-xl bg-[var(--surface)] p-5.5 shadow-2xl"
        style={{ maxHeight: "calc(100vh - 40px)" }}
      >
        <div className="text-[17px] font-semibold">{title}</div>
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Company
            <input
              required
              value={form.company}
              onChange={(e) => onChange("company", e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Role
            <input
              required
              value={form.role}
              onChange={(e) => onChange("role", e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Location
            <input
              value={form.location}
              onChange={(e) => onChange("location", e.target.value)}
              placeholder="City, State"
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Work mode
            <select
              value={form.workMode}
              onChange={(e) => onChange("workMode", e.target.value as WorkMode)}
              className={fieldClass}
            >
              {WORK_MODES.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Status
            <select
              value={form.status}
              onChange={(e) => onChange("status", e.target.value as JobFormData["status"])}
              className={fieldClass}
            >
              {STATUS_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Date applied
            <input
              type="date"
              value={form.date}
              onChange={(e) => onChange("date", e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Salary
            <input
              value={form.salary}
              onChange={(e) => onChange("salary", e.target.value)}
              placeholder="$120k–140k"
              className={fieldClass}
            />
          </label>
        </div>
        <label className={labelClass}>
          Posting link
          <input
            value={form.link}
            onChange={(e) => onChange("link", e.target.value)}
            placeholder="https://"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Job description
          <textarea
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            rows={4}
            placeholder="Paste the key details from the posting"
            className={`${fieldClass} resize-y leading-relaxed`}
          />
        </label>
        <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-[var(--border-strong)] bg-white px-3.5 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-md border-0 bg-[var(--foreground)] px-3.5 py-2 text-sm font-medium text-[var(--surface)]"
          >
            {saveLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
