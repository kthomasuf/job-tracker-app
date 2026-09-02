"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { APPLICATION_STATUSES } from "@/lib/types";
import { type PredefinedLocation } from "@/lib/cities";

const FIELD =
  "w-full rounded border border-[var(--border-input)] bg-transparent px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-placeholder)]";

export default function AddJobModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<string>(APPLICATION_STATUSES[0]);

  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<PredefinedLocation | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<PredefinedLocation[]>([]);

  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillError, setAutofillError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/locations?q=${encodeURIComponent(locationQuery)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((locs: PredefinedLocation[]) => setSuggestions(locs))
        .catch(() => {
          // aborted or failed — leave the previous suggestions in place
        });
    }, 200);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [open, locationQuery]);

  function resetForm() {
    setCompany("");
    setRole("");
    setStatus(APPLICATION_STATUSES[0]);
    setLocationQuery("");
    setSelectedLocation(null);
    setShowSuggestions(false);
    setSuggestions([]);
    setLinkedinUrl("");
    setAutofillError(null);
    setError(null);
  }

  function close() {
    setOpen(false);
    resetForm();
  }

  function selectLocation(loc: PredefinedLocation) {
    setLocationQuery(loc.name);
    setSelectedLocation(loc);
    setShowSuggestions(false);
  }

  async function matchLocationText(rawLocation: string) {
    const cityGuess = rawLocation.split(",")[0]?.trim();
    if (!cityGuess) return;
    try {
      const res = await fetch(`/api/locations?q=${encodeURIComponent(cityGuess)}`);
      if (!res.ok) return;
      const matches: PredefinedLocation[] = await res.json();
      const normalizedRaw = rawLocation.toLowerCase();
      // Prefer a candidate whose full "City, ST"/"City, Country" name is
      // contained in the raw text — disambiguates same-named cities (e.g.
      // "Santa Clara, CA" vs. "Santa Clara, Cuba") using whatever region
      // detail LinkedIn gave us, instead of matching on city name alone.
      const best =
        matches.find((m) => normalizedRaw.includes(m.name.toLowerCase())) ??
        matches.find((m) => m.name.toLowerCase().startsWith(cityGuess.toLowerCase())) ??
        matches[0];
      if (best) selectLocation(best);
    } catch {
      // best-effort — leave location for the user to search manually
    }
  }

  async function handleAutofill() {
    if (!linkedinUrl.trim()) return;

    setIsAutofilling(true);
    setAutofillError(null);

    try {
      const res = await fetch("/api/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkedinUrl.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAutofillError(data?.error ?? "Couldn't read that posting");
        return;
      }

      if (data.company) setCompany(data.company);
      if (data.role) setRole(data.role);
      if (data.location) await matchLocationText(data.location);
    } catch {
      setAutofillError("Couldn't reach that posting — fill in the fields manually");
    } finally {
      setIsAutofilling(false);
    }
  }

  async function handleSubmit() {
    if (!selectedLocation) {
      setError("Pick a location from the list");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      company,
      role,
      location: selectedLocation.name,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      status,
    };

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Failed to add application");
      return;
    }

    router.refresh();
    setOpen(false);
    resetForm();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)]"
      >
        + Add job
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[var(--scrim)]"
            onClick={close}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-job-heading"
            className="relative z-10 w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-modal)]"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 id="add-job-heading" className="text-lg font-semibold text-[var(--text)]">
                Add Application
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="rounded p-1 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            </div>

            <form
              id="add-application-form"
              action={handleSubmit}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
                <span className="text-xs uppercase tracking-wide text-[var(--text-eyebrow)]">
                  Autofill from LinkedIn
                </span>
                <div className="flex gap-2">
                  <input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/jobs/view/..."
                    className={FIELD}
                  />
                  <button
                    type="button"
                    onClick={handleAutofill}
                    disabled={isAutofilling || !linkedinUrl.trim()}
                    className="shrink-0 rounded bg-[var(--accent)] px-3 py-2 text-sm text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
                  >
                    {isAutofilling ? "Fetching..." : "Autofill"}
                  </button>
                </div>
                {autofillError && (
                  <p className="text-sm text-[var(--reject-text)]">{autofillError}</p>
                )}
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-wide text-[var(--text-eyebrow)]">
                  Company
                </span>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company"
                  required
                  className={FIELD}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-wide text-[var(--text-eyebrow)]">
                  Role
                </span>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Role"
                  required
                  className={FIELD}
                />
              </label>

              <div className="relative flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-wide text-[var(--text-eyebrow)]">
                  Location
                </span>
                <input
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    setSelectedLocation(null);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setShowSuggestions(false)}
                  placeholder="Search for a location..."
                  autoComplete="off"
                  required
                  className={FIELD}
                />
                {showSuggestions && (
                  <ul className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-y-auto rounded border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)]">
                    {suggestions.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-[var(--text-muted)]">
                        No matching locations
                      </li>
                    ) : (
                      suggestions.map((loc) => (
                        <li key={loc.name}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectLocation(loc)}
                            className="w-full px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--surface-subtle)]"
                          >
                            {loc.name}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-wide text-[var(--text-eyebrow)]">
                  Stage
                </span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={FIELD}
                >
                  {APPLICATION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              {error && <p className="text-sm text-[var(--reject-text)]">{error}</p>}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="rounded px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded bg-[var(--accent)] px-4 py-2 text-sm text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
