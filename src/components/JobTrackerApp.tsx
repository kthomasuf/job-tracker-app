"use client";

import { useMemo, useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { AppHeader } from "@/components/AppHeader";
import { FilterBar } from "@/components/FilterBar";
import { ApplicationsTable } from "@/components/ApplicationsTable";
import { JobDetailPanel } from "@/components/JobDetailPanel";
import { JobFormModal } from "@/components/JobFormModal";
import { STATUS_NAMES } from "@/lib/statuses";
import { BLANK_FORM } from "@/lib/seed-data";
import { today } from "@/lib/format";
import type { Job, JobFormData, Layout, SortKey, Status } from "@/lib/types";

interface JobTrackerAppProps {
  initialJobs: Job[];
  userEmail?: string | null;
}

export function JobTrackerApp({ initialJobs, userEmail }: JobTrackerAppProps) {
  const { jobs, selId, setSelId, addJob, editJob, removeJob, setStatus, setNotes } = useJobs(initialJobs);

  const [filter, setFilter] = useState<"All" | Status>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("date");
  const [dir, setDir] = useState<1 | -1>(-1);
  const [layout, setLayout] = useState<Layout>("Split");
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<JobFormData>(BLANK_FORM);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs
      .filter((j) => filter === "All" || j.status === filter)
      .filter((j) => !q || [j.company, j.role, j.location].join(" ").toLowerCase().includes(q))
      .slice()
      .sort((a, b) => {
        const av = sort === "status" ? STATUS_NAMES.indexOf(a.status) : a[sort] || "";
        const bv = sort === "status" ? STATUS_NAMES.indexOf(b.status) : b[sort] || "";
        return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
      });
  }, [jobs, filter, query, sort, dir]);

  const sel = jobs.find((j) => j.id === selId);
  const drawer = layout === "Drawer";
  const drawerOpen = drawer && !!sel;

  const handleSort = (key: SortKey) => {
    setDir((d) => (sort === key ? ((-d) as 1 | -1) : 1));
    setSort(key);
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...BLANK_FORM, date: today() });
    setFormOpen(true);
  };

  const openEdit = () => {
    if (!sel) return;
    setEditId(sel.id);
    setForm({
      company: sel.company,
      role: sel.role,
      location: sel.location,
      workMode: sel.workMode,
      status: sel.status,
      date: sel.date,
      salary: sel.salary,
      link: sel.link,
      description: sel.description,
    });
    setFormOpen(true);
  };

  const handleFormChange = <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = () => {
    if (editId) {
      editJob(editId, form);
    } else {
      addJob(form);
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!sel) return;
    if (!confirm(`Delete ${sel.company}?`)) return;
    removeJob(sel.id);
  };

  const mainColsClass =
    layout === "Split" ? "grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))]" : "grid-cols-1";

  const asideClass =
    drawer
      ? `absolute top-0 right-0 bottom-0 z-5 w-[min(460px,100vw)] overflow-y-auto bg-[var(--surface)] shadow-[-12px_0_40px_rgba(0,0,0,0.12)] ${drawerOpen ? "block" : "hidden"}`
      : layout === "Stacked"
        ? "border-t border-[var(--border)] bg-[var(--surface)]"
        : "sticky top-0 bg-[var(--surface)]";

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        total={jobs.length}
        layout={layout}
        onLayoutChange={setLayout}
        onAddClick={openAdd}
        userEmail={userEmail}
      />
      <FilterBar jobs={jobs} filter={filter} onFilterChange={setFilter} query={query} onQueryChange={setQuery} />

      <main className={`relative grid flex-1 items-start ${mainColsClass}`}>
        <div className={layout === "Split" ? "min-w-0 border-r border-[var(--border)]" : "min-w-0"}>
          <ApplicationsTable
            rows={visible}
            sort={sort}
            dir={dir}
            onSort={handleSort}
            selId={selId}
            onSelect={setSelId}
          />
        </div>

        <aside className={asideClass}>
          <JobDetailPanel
            job={sel}
            drawer={drawer}
            showMap
            onClose={() => setSelId(null)}
            onEdit={openEdit}
            onDelete={handleDelete}
            onStatusChange={(status) => sel && setStatus(sel, status)}
            onNotesChange={(notes) => sel && setNotes(sel.id, notes)}
          />
        </aside>
      </main>

      <JobFormModal
        open={formOpen}
        title={editId ? "Edit job" : "Add job"}
        saveLabel={editId ? "Save changes" : "Add job"}
        form={form}
        onChange={handleFormChange}
        onSubmit={handleSave}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}
