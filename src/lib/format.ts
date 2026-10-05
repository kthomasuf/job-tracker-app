export function formatDate(date: string): string {
  if (!date) return "—";
  return new Date(`${date}T00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
