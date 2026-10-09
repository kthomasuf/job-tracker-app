export type WorkMode = "On-site" | "Hybrid" | "Remote";

export type Status =
  | "Saved"
  | "Applied"
  | "Screen"
  | "Interview"
  | "Final"
  | "Offer"
  | "Rejected"
  | "Ghosted";

export interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  workMode: WorkMode;
  status: Status;
  date: string;
  salary: string;
  link: string;
  description: string;
  notes: string;
  lat: number | null;
  lon: number | null;
}

export type JobFormData = Pick<
  Job,
  | "company"
  | "role"
  | "location"
  | "workMode"
  | "status"
  | "date"
  | "salary"
  | "link"
  | "description"
>;

export type SortKey = "company" | "role" | "status" | "location" | "date";

export type Layout = "Split" | "Stacked" | "Drawer";
