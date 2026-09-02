import { type ApplicationStatus } from "@/lib/types";

export const STATUS_PILL_STYLE: Record<
  ApplicationStatus,
  { backgroundColor: string; color: string }
> = {
  Applied: { backgroundColor: "var(--status-applied-wash)", color: "var(--status-applied-text)" },
  Screening: {
    backgroundColor: "var(--status-screening-wash)",
    color: "var(--status-screening-text)",
  },
  Interviewing: {
    backgroundColor: "var(--status-interviewing-wash)",
    color: "var(--status-interviewing-text)",
  },
  Offer: { backgroundColor: "var(--status-offer)", color: "var(--status-offer-text)" },
  Awaiting: {
    backgroundColor: "var(--status-awaiting-wash)",
    color: "var(--status-awaiting-text)",
  },
  Rejected: { backgroundColor: "var(--status-rejected)", color: "var(--status-rejected-text)" },
};

export function statusPillStyle(status: string) {
  return STATUS_PILL_STYLE[status as ApplicationStatus] ?? STATUS_PILL_STYLE.Applied;
}
