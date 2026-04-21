export const TOPICS = [
  { slug: "ai", label: "AI / ML", color: "bg-purple-500", ringColor: "ring-purple-500/40" },
  { slug: "web3", label: "Web3", color: "bg-pink-500", ringColor: "ring-pink-500/40" },
  { slug: "web-dev", label: "Web Dev", color: "bg-blue-500", ringColor: "ring-blue-500/40" },
  { slug: "mobile", label: "Mobile", color: "bg-green-500", ringColor: "ring-green-500/40" },
  { slug: "design", label: "Design", color: "bg-orange-500", ringColor: "ring-orange-500/40" },
  { slug: "startup", label: "Startup", color: "bg-red-500", ringColor: "ring-red-500/40" },
  { slug: "product", label: "Product", color: "bg-yellow-500", ringColor: "ring-yellow-500/40" },
  { slug: "devops", label: "DevOps", color: "bg-slate-500", ringColor: "ring-slate-500/40" },
  { slug: "data", label: "Data", color: "bg-cyan-500", ringColor: "ring-cyan-500/40" },
  { slug: "open-source", label: "Open Source", color: "bg-emerald-500", ringColor: "ring-emerald-500/40" },
  { slug: "security", label: "Security", color: "bg-rose-500", ringColor: "ring-rose-500/40" },
  { slug: "fintech", label: "Fintech", color: "bg-lime-500", ringColor: "ring-lime-500/40" },
  { slug: "hackathon", label: "Hackathon", color: "bg-amber-500", ringColor: "ring-amber-500/40" },
] as const;

export type TopicSlug = (typeof TOPICS)[number]["slug"];

export const TOPIC_BY_SLUG: Record<string, (typeof TOPICS)[number]> = Object.fromEntries(
  TOPICS.map((t) => [t.slug, t]),
);

export const CITIES = [
  "Bengaluru",
  "Hyderabad",
  "Delhi",
  "Mumbai",
  "Pune",
  "Chennai",
  "Online",
] as const;

export type City = (typeof CITIES)[number];
