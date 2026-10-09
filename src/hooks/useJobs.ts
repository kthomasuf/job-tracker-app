"use client";

import { useRef, useState, useTransition } from "react";
import {
  addJob as addJobAction,
  editJob as editJobAction,
  removeJob as removeJobAction,
  setJobNotes as setJobNotesAction,
  setJobStatus as setJobStatusAction,
} from "@/lib/actions/jobs";
import type { Job, JobFormData, Status } from "@/lib/types";

export function useJobs(initialJobs: Job[]) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [selId, setSelId] = useState<string | null>(initialJobs[0]?.id ?? null);
  const [, startTransition] = useTransition();
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addJob = (form: JobFormData) => {
    startTransition(async () => {
      const job = await addJobAction(form);
      setJobs((prev) => [job, ...prev]);
      setSelId(job.id);
    });
  };

  const editJob = (id: string, form: JobFormData) => {
    startTransition(async () => {
      const job = await editJobAction(id, form);
      setJobs((prev) => prev.map((j) => (j.id === id ? job : j)));
    });
  };

  const removeJob = (id: string) => {
    startTransition(async () => {
      await removeJobAction(id);
      setJobs((prev) => {
        const next = prev.filter((j) => j.id !== id);
        setSelId((cur) => (cur === id ? (next[0]?.id ?? null) : cur));
        return next;
      });
    });
  };

  const setStatus = (job: Job, status: Status) => {
    if (job.status === status) return;
    startTransition(async () => {
      const updated = await setJobStatusAction(job.id, status);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
    });
  };

  // Notes update the UI immediately but are debounced before hitting the
  // server, so typing doesn't fire a request per keystroke.
  const setNotes = (id: string, notes: string) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, notes } : j)));
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      startTransition(async () => {
        await setJobNotesAction(id, notes);
      });
    }, 500);
  };

  return { jobs, selId, setSelId, addJob, editJob, removeJob, setStatus, setNotes };
}
