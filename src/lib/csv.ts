import Papa from "papaparse";
import { STATUS_NAMES } from "./statuses";
import type { Job, WorkMode, Status } from "./types";

const WORK_MODES: WorkMode[] = ["On-site", "Hybrid", "Remote"];

const COLUMNS = [
  "Company",
  "Role",
  "Status",
  "Location",
  "Work Mode",
  "Date Applied",
  "Salary",
  "Posting Link",
  "Description",
  "Notes",
  "Latitude",
  "Longitude",
] as const;

export function jobsToCsv(jobs: Job[]): string {
  const rows = jobs.map((j) => ({
    Company: j.company,
    Role: j.role,
    Status: j.status,
    Location: j.location,
    "Work Mode": j.workMode,
    "Date Applied": j.date,
    Salary: j.salary,
    "Posting Link": j.link,
    Description: j.description,
    Notes: j.notes,
    Latitude: j.lat ?? "",
    Longitude: j.lon ?? "",
  }));
  return Papa.unparse({ fields: [...COLUMNS], data: rows });
}

function cell(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const match = Object.keys(row).find((k) => k.trim().toLowerCase() === key.toLowerCase());
    if (match && row[match] != null) return row[match].trim();
  }
  return "";
}

export interface ParseResult {
  jobs: Omit<Job, "id">[];
  skipped: number;
}

export function csvToJobs(csvText: string): ParseResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const jobs: Omit<Job, "id">[] = [];
  let skipped = 0;

  for (const row of parsed.data) {
    const company = cell(row, "Company");
    const role = cell(row, "Role");
    if (!company && !role) {
      skipped++;
      continue;
    }

    const statusRaw = cell(row, "Status");
    const status = (STATUS_NAMES as string[]).includes(statusRaw) ? (statusRaw as Status) : "Applied";

    const workModeRaw = cell(row, "Work Mode", "WorkMode");
    const workMode = (WORK_MODES as string[]).includes(workModeRaw) ? (workModeRaw as WorkMode) : "On-site";

    const latRaw = cell(row, "Latitude", "Lat");
    const lonRaw = cell(row, "Longitude", "Lon", "Lng");
    const lat = latRaw && !Number.isNaN(Number(latRaw)) ? Number(latRaw) : null;
    const lon = lonRaw && !Number.isNaN(Number(lonRaw)) ? Number(lonRaw) : null;

    jobs.push({
      company,
      role,
      status,
      location: cell(row, "Location"),
      workMode,
      date: cell(row, "Date Applied", "Date"),
      salary: cell(row, "Salary"),
      link: cell(row, "Posting Link", "Link"),
      description: cell(row, "Description"),
      notes: cell(row, "Notes"),
      lat,
      lon,
    });
  }

  return { jobs, skipped };
}
