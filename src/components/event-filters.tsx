"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { TOPICS, CITIES } from "@/data/topics";

function setParam(params: URLSearchParams, key: string, value: string | null) {
  const next = new URLSearchParams(params);
  if (value === null || value === "" || value === "all") {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  return next;
}

export function EventFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const topic = params.get("topic");
  const city = params.get("city") ?? "all";
  const mode = params.get("mode") ?? "all";
  const q = params.get("q") ?? "";

  function updateParam(key: string, value: string | null) {
    const next = setParam(params, key, value);
    startTransition(() => {
      router.push(`/dashboard?${next.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <input
          type="search"
          defaultValue={q}
          placeholder="Search events, organizers, topics…"
          className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm outline-none transition-colors placeholder:text-black/40 focus:border-black/30 dark:border-white/15 dark:bg-white/[0.02] dark:placeholder:text-white/40 dark:focus:border-white/40"
          onChange={(e) => {
            const v = e.currentTarget.value;
            if (v.length === 0 || v.length >= 2) updateParam("q", v);
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => updateParam("topic", null)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            !topic
              ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
              : "border-black/10 text-black/70 hover:border-black/30 dark:border-white/15 dark:text-white/70 dark:hover:border-white/40"
          }`}
        >
          All topics
        </button>
        {TOPICS.map((t) => {
          const active = topic === t.slug;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => updateParam("topic", active ? null : t.slug)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-black/10 text-black/70 hover:border-black/30 dark:border-white/15 dark:text-white/70 dark:hover:border-white/40"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${t.color}`} aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
          City
          <select
            value={city}
            onChange={(e) => updateParam("city", e.currentTarget.value)}
            className="rounded-md border border-black/10 bg-white px-2.5 py-1.5 text-xs text-black focus:border-black/40 focus:outline-none dark:border-white/15 dark:bg-white/[0.02] dark:text-white"
          >
            <option value="all">All cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="inline-flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
          Mode
          <select
            value={mode}
            onChange={(e) => updateParam("mode", e.currentTarget.value)}
            className="rounded-md border border-black/10 bg-white px-2.5 py-1.5 text-xs text-black focus:border-black/40 focus:outline-none dark:border-white/15 dark:bg-white/[0.02] dark:text-white"
          >
            <option value="all">All</option>
            <option value="in-person">In person</option>
            <option value="virtual">Virtual</option>
          </select>
        </label>

        {(topic || city !== "all" || mode !== "all" || q) && (
          <button
            type="button"
            onClick={() => {
              startTransition(() => router.push("/dashboard", { scroll: false }));
            }}
            className="ml-auto text-xs font-medium text-black/60 underline-offset-4 hover:underline dark:text-white/60"
          >
            Clear filters
          </button>
        )}

        {isPending && (
          <span className="text-xs text-black/40 dark:text-white/40">updating…</span>
        )}
      </div>
    </div>
  );
}
