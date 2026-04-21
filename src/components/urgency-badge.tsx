import type { Urgency } from "@/lib/ranking";
import { urgencyLabel } from "@/lib/ranking";

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const label = urgencyLabel(urgency);
  if (!urgency || !label) return null;

  const styles: Record<NonNullable<Urgency>, string> = {
    "happening-today": "bg-red-500/15 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    "closing-soon": "bg-amber-500/15 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    "this-weekend": "bg-blue-500/15 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[urgency]}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60"
          aria-hidden
        />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      </span>
      {label}
    </span>
  );
}

export function DeadlineCountdown({ deadline }: { deadline?: string }) {
  if (!deadline) return null;
  const now = new Date();
  const d = new Date(deadline);
  const diffMs = d.getTime() - now.getTime();
  if (diffMs <= 0) return null;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let label: string;
  if (days === 0 && hours === 0) label = "Closes soon";
  else if (days === 0) label = `Closes in ${hours}h`;
  else if (days === 1) label = "Closes tomorrow";
  else if (days <= 7) label = `Closes in ${days}d`;
  else return null;

  return (
    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">{label}</span>
  );
}
