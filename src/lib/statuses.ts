import type { Status } from "./types";

export const STATUS_NAMES: Status[] = [
  "Saved",
  "Applied",
  "Screen",
  "Interview",
  "Final",
  "Offer",
  "Rejected",
  "Ghosted",
];

interface StatusStyle {
  dot: string;
  bg: string;
  fg: string;
}

export const STATUS_STYLES: Record<Status, StatusStyle> = {
  Saved: {
    dot: "var(--status-saved-dot)",
    bg: "var(--status-saved-bg)",
    fg: "var(--status-saved-fg)",
  },
  Applied: {
    dot: "var(--status-applied-dot)",
    bg: "var(--status-applied-bg)",
    fg: "var(--status-applied-fg)",
  },
  Screen: {
    dot: "var(--status-screen-dot)",
    bg: "var(--status-screen-bg)",
    fg: "var(--status-screen-fg)",
  },
  Interview: {
    dot: "var(--status-interview-dot)",
    bg: "var(--status-interview-bg)",
    fg: "var(--status-interview-fg)",
  },
  Final: {
    dot: "var(--status-final-dot)",
    bg: "var(--status-final-bg)",
    fg: "var(--status-final-fg)",
  },
  Offer: {
    dot: "var(--status-offer-dot)",
    bg: "var(--status-offer-bg)",
    fg: "var(--status-offer-fg)",
  },
  Rejected: {
    dot: "var(--status-rejected-dot)",
    bg: "var(--status-rejected-bg)",
    fg: "var(--status-rejected-fg)",
  },
  Ghosted: {
    dot: "var(--status-ghosted-dot)",
    bg: "var(--status-ghosted-bg)",
    fg: "var(--status-ghosted-fg)",
  },
};
