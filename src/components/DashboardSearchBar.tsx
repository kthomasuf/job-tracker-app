"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

export default function DashboardSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(next: string) {
    setValue(next);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.trim()) params.set("q", next);
      else params.delete("q");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 250);
  }

  return (
    <input
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Search companies, roles..."
      className="w-64 rounded-lg border border-[var(--border-input)] bg-transparent px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-placeholder)]"
    />
  );
}
