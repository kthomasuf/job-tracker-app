"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/map", label: "Map" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-1 border-r border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-4 flex items-center gap-2 px-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent)] text-sm font-bold text-[var(--text-on-accent)]">
          J
        </span>
        <span className="text-base font-semibold text-[var(--text)]">Job Tracker</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-[var(--accent-wash)] font-medium text-[var(--text)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
