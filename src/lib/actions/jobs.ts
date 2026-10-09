"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { today } from "@/lib/format";
import type { Job, JobFormData, Status, WorkMode } from "@/lib/types";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");
  return session.user.id;
}

function toJob(row: {
  id: string;
  company: string;
  role: string;
  location: string;
  workMode: string;
  status: string;
  date: string;
  salary: string;
  link: string;
  description: string;
  notes: string;
  lat: number | null;
  lon: number | null;
}): Job {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    location: row.location,
    workMode: row.workMode as WorkMode,
    status: row.status as Status,
    date: row.date,
    salary: row.salary,
    link: row.link,
    description: row.description,
    notes: row.notes,
    lat: row.lat,
    lon: row.lon,
  };
}

async function geocode(location: string): Promise<{ lat: number | null; lon: number | null }> {
  if (!location || /remote/i.test(location)) return { lat: null, lon: null };
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`,
      { headers: { "User-Agent": "job-tracker-app (personal use)" } },
    );
    const data = await res.json();
    if (data[0]) return { lat: Number(data[0].lat), lon: Number(data[0].lon) };
  } catch {
    // geocoding is best-effort; leave the job without coordinates on failure
  }
  return { lat: null, lon: null };
}

export async function getJobs(): Promise<Job[]> {
  const userId = await requireUserId();
  const rows = await prisma.job.findMany({ where: { userId } });
  return rows.map(toJob);
}

export async function addJob(form: JobFormData): Promise<Job> {
  const userId = await requireUserId();
  const { lat, lon } = await geocode(form.location);
  const row = await prisma.job.create({ data: { ...form, userId, notes: "", lat, lon } });
  return toJob(row);
}

export async function editJob(id: string, form: JobFormData): Promise<Job> {
  const userId = await requireUserId();
  const existing = await prisma.job.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Job not found");

  const { lat, lon } =
    existing.location !== form.location
      ? await geocode(form.location)
      : { lat: existing.lat, lon: existing.lon };

  const row = await prisma.job.update({ where: { id }, data: { ...form, lat, lon } });
  return toJob(row);
}

export async function removeJob(id: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.job.deleteMany({ where: { id, userId } });
}

export async function setJobStatus(id: string, status: Status): Promise<Job> {
  const userId = await requireUserId();
  const existing = await prisma.job.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Job not found");

  const date = existing.date || (status !== "Saved" ? today() : "");
  const row = await prisma.job.update({ where: { id }, data: { status, date } });
  return toJob(row);
}

export async function setJobNotes(id: string, notes: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.job.updateMany({ where: { id, userId }, data: { notes } });
}
