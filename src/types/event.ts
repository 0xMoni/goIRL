export type EventSource =
  | "luma"
  | "devfolio"
  | "mlh"
  | "unstop"
  | "meetup"
  | "manual"
  | "user-submission";

export type Difficulty = "beginner" | "intermediate" | "advanced";

// What the room actually feels like. Separate from topics (the subject).
export type VibeTag =
  | "networking-heavy"
  | "hands-on"
  | "chill"
  | "competitive"
  | "beginner-friendly"
  | "talks-only"
  | "social-mixer"
  | "workshop"
  | "high-energy"
  | "intimate";

// Who is actually in the room
export type AudienceSegment =
  | "students"
  | "early-devs"
  | "senior-devs"
  | "designers"
  | "founders"
  | "pms"
  | "researchers"
  | "hobbyists"
  | "everyone";

export interface TechEvent {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  city: string | null;
  country: string;
  isVirtual: boolean;
  registerUrl: string;
  organizer: string;
  source: EventSource;
  sourceId: string;
  topics: string[];
  coverImage?: string;

  // Discovery / decision-helping
  price: number | null;
  isFree: boolean;
  deadline?: string;
  tags?: string[];
  difficulty?: Difficulty;
  whyAttend?: string;
  perks?: string[];
  interestedCount?: number;

  // Connection-first fields
  vibeTags?: VibeTag[];
  audience?: AudienceSegment[];
  isBeginnerFriendly?: boolean;
  comfortNote?: string;
  isFeatured?: boolean;
}
