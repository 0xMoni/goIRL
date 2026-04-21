import type { TechEvent } from "@/types/event";
import { formatPrice } from "@/lib/ranking";

export function PriceBadge({ event, size = "sm" }: { event: TechEvent; size?: "sm" | "md" }) {
  const label = formatPrice(event);
  const isFree = event.isFree || event.price === 0;
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wide ${padding} ${
        isFree
          ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-black/5 text-black/70 dark:bg-white/10 dark:text-white/80"
      }`}
    >
      {label}
    </span>
  );
}
