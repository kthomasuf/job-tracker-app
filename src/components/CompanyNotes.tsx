"use client";

import { useState } from "react";

export default function CompanyNotes({
  company,
  initialNotes,
}: {
  company: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotes, setSavedNotes] = useState(initialNotes);
  const [error, setError] = useState<string | null>(null);

  const isDirty = notes !== savedNotes;

  async function save() {
    setIsSaving(true);
    setError(null);

    const res = await fetch(`/api/companies/${encodeURIComponent(company)}/notes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });

    setIsSaving(false);

    if (!res.ok) {
      setError("Failed to save notes");
      return;
    }

    setSavedNotes(notes);
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--text)]">Notes</h2>
        <span className="text-xs text-[var(--text-muted)]">
          {error ? (
            <span className="text-[var(--reject-text)]">{error}</span>
          ) : isSaving ? (
            "Saving..."
          ) : isDirty ? (
            "Unsaved changes"
          ) : (
            "Saved"
          )}
        </span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Interview impressions, contacts, follow-ups..."
        rows={6}
        className="w-full flex-1 resize-y rounded border border-[var(--border-input)] bg-transparent p-3 text-sm text-[var(--text)] placeholder:text-[var(--text-placeholder)]"
      />
      <button
        type="button"
        onClick={save}
        disabled={isSaving || !isDirty}
        className="mt-3 rounded bg-[var(--accent)] px-4 py-2 text-sm text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        Save notes
      </button>
    </div>
  );
}
