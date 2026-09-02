export const APPLICATION_STATUSES = [
  "Applied",
  "Screening",
  "Interviewing",
  "Offer",
  "Awaiting",
  "Rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type { Application } from "@/generated/prisma/client";
