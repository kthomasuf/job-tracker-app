"use client";

import { useCallback, useEffect, useState } from "react";
import type { Job, JobFormData, Status } from "@/lib/types";
import { SEED_JOBS } from "@/lib/seed-data";
import { today } from "@/lib/format";

const STORAGE_KEY = "job-tracker.jobs";

function persist(jobs: Job[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    // storage unavailable (private mode, quota) — in-memory state still works
  }
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>(SEED_JOBS);
  // Starts false on both the prerendered HTML and the client's first paint,
  // so nothing renders off this data until the real (localStorage-backed)
  // value is known — avoids a flash of seed/stale jobs before storage loads.
  const [loaded, setLoaded] = useState(false);

  // Reads a browser-only API, so it must run after mount rather than during
  // the initial (server-prerendered) render — hence the one-time effect
  // instead of a lazy useState initializer.
  useEffect(() => {
    let next = SEED_JOBS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored = raw ? (JSON.parse(raw) as Job[]) : null;
      if (stored && stored.length) next = stored;
    } catch {
      // ignore corrupt storage, fall back to seed data
    }
    // Batched by React into a single re-render, so consumers never see
    // loaded=true paired with the old (seed) jobs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJobs(next);
    setLoaded(true);
  }, []);

  const updateJob = useCallback((id: number, patch: Partial<Job>) => {
    setJobs((prev) => {
      const next = prev.map((j) => (j.id === id ? { ...j, ...patch } : j));
      persist(next);
      return next;
    });
  }, []);

  const geocode = useCallback(
    async (id: number, location: string) => {
      if (!location || /remote/i.test(location)) {
        updateJob(id, { lat: null, lon: null });
        return;
      }
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`,
        );
        const data = await res.json();
        if (data[0]) {
          updateJob(id, { lat: Number(data[0].lat), lon: Number(data[0].lon) });
        }
      } catch {
        // geocoding is best-effort; leave existing lat/lon as-is on failure
      }
    },
    [updateJob],
  );

  const addJob = useCallback(
    (form: JobFormData) => {
      const id = Date.now();
      const job: Job = { ...form, id, notes: "", lat: null, lon: null };
      setJobs((prev) => {
        const next = [job, ...prev];
        persist(next);
        return next;
      });
      geocode(id, form.location);
      return id;
    },
    [geocode],
  );

  const editJob = useCallback(
    (id: number, form: JobFormData, previousLocation: string) => {
      updateJob(id, { ...form });
      if (previousLocation !== form.location) geocode(id, form.location);
    },
    [updateJob, geocode],
  );

  const importJobs = useCallback((imported: Omit<Job, "id">[]) => {
    setJobs((prev) => {
      const newJobs = imported.map((job, i) => ({ ...job, id: Date.now() + i }));
      const next = [...newJobs, ...prev];
      persist(next);
      return next;
    });
  }, []);

  const removeJob = useCallback((id: number) => {
    setJobs((prev) => {
      const next = prev.filter((j) => j.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const setStatus = useCallback(
    (job: Job, status: Status) => {
      if (job.status === status) return;
      updateJob(job.id, { status, date: job.date || (status !== "Saved" ? today() : "") });
    },
    [updateJob],
  );

  const setNotes = useCallback(
    (id: number, notes: string) => {
      updateJob(id, { notes });
    },
    [updateJob],
  );

  return { jobs, loaded, addJob, editJob, removeJob, importJobs, setStatus, setNotes };
}
