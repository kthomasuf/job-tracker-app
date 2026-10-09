"use client";

import { signOutAction } from "@/lib/actions/auth";
import type { Layout } from "@/lib/types";

const LAYOUTS: Layout[] = ["Split", "Stacked", "Drawer"];

interface AppHeaderProps {
  total: number;
  layout: Layout;
  onLayoutChange: (layout: Layout) => void;
  onAddClick: () => void;
  userEmail?: string | null;
}

export function AppHeader({ total, layout, onLayoutChange, onAddClick, userEmail }: AppHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
      <div className="flex items-baseline gap-3">
        <div className="text-[17px] font-semibold tracking-tight">Job Tracker</div>
        <div className="font-mono text-xs text-[var(--muted)]">{total} applications</div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-0.5 rounded-[7px] bg-[#ecebe6] p-0.5">
          {LAYOUTS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onLayoutChange(l)}
              className="cursor-pointer rounded-[5px] border-0 px-2.5 py-1.5 text-[13px]"
              style={{
                background: layout === l ? "#fff" : "transparent",
                boxShadow: layout === l ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="cursor-pointer rounded-md border-0 bg-[var(--foreground)] px-3.5 py-2 text-sm font-medium text-[var(--surface)] hover:bg-[#3a3833]"
        >
          + Add job
        </button>
        {userEmail && (
          <div className="flex items-center gap-2 border-l border-[var(--border-strong)] pl-3 text-[13px] text-[var(--muted)]">
            <span className="max-w-[160px] truncate">{userEmail}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="cursor-pointer rounded-md border border-[var(--border-strong)] bg-white px-2.5 py-1.5 text-[13px] hover:bg-[#f1efea]"
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
