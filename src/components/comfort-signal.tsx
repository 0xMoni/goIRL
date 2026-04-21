export function ComfortSignal({ note, compact = false }: { note?: string; compact?: boolean }) {
  if (!note) return null;

  if (compact) {
    return (
      <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-black/60 dark:text-white/60">
        <HandshakeIcon className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>{note}</span>
      </p>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm text-black/80 dark:text-white/80">
      <HandshakeIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <span>{note}</span>
    </div>
  );
}

export function AudienceLine({ audience }: { audience?: string[] }) {
  if (!audience || audience.length === 0) return null;
  const pretty = audience
    .slice(0, 4)
    .map((a) =>
      a
        .replace(/-/g, " ")
        .replace(/\bpms\b/i, "PMs")
        .replace(/\b(devs|dev)\b/i, (m) => m),
    )
    .join(", ");
  return (
    <p className="text-sm text-black/70 dark:text-white/70">
      <span className="font-medium">Expect:</span> {pretty}
    </p>
  );
}

function HandshakeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M11 17l-5-5 3-3 3 3" />
      <path d="M13 7l3-3 5 5-5 5-3-3" />
      <path d="M12 12l4 4" />
    </svg>
  );
}
