import { TOPIC_BY_SLUG } from "@/data/topics";

export function TopicChip({ slug, size = "sm" }: { slug: string; size?: "sm" | "md" }) {
  const topic = TOPIC_BY_SLUG[slug];
  if (!topic) return null;
  const text = size === "sm" ? "text-xs" : "text-sm";
  const pad = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-black/[0.03] ${pad} ${text} font-medium text-black/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${topic.color}`} aria-hidden />
      {topic.label}
    </span>
  );
}
