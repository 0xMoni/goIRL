import type { VibeTag } from "@/types/event";

const VIBE_LABELS: Record<VibeTag, string> = {
  "networking-heavy": "Networking",
  "hands-on": "Hands-on",
  chill: "Chill",
  competitive: "Competitive",
  "beginner-friendly": "Beginner-friendly",
  "talks-only": "Talks",
  "social-mixer": "Mixer",
  workshop: "Workshop",
  "high-energy": "High-energy",
  intimate: "Small room",
};

const VIBE_CLASSES: Record<VibeTag, string> = {
  "networking-heavy":
    "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  "hands-on": "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  chill: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  competitive: "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  "beginner-friendly":
    "bg-lime-500/10 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300",
  "talks-only": "bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  "social-mixer": "bg-pink-500/10 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
  workshop: "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "high-energy": "bg-orange-500/10 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  intimate: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

export function VibeChip({ vibe, size = "sm" }: { vibe: VibeTag; size?: "sm" | "md" }) {
  const label = VIBE_LABELS[vibe];
  if (!label) return null;
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${pad} ${VIBE_CLASSES[vibe]}`}
    >
      {label}
    </span>
  );
}
