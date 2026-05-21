"use client";

import { useState } from "react";

type ShareButtonProps = {
  title: string;
  text: string;
  url: string;
  variant?: "default" | "icon-only";
};

export function ShareButton({ title, text, url, variant = "default" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    // Use native share if available (mobile PWA)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  if (variant === "icon-only") {
    return (
      <button
        type="button"
        onClick={handleShare}
        className="rounded-full p-2 text-[var(--foreground)]/70 transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)]"
        title="Share goIRL"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-medium text-[var(--muted)] ring-1 ring-[var(--border)] transition-colors hover:bg-[var(--foreground)]/[0.03] hover:text-[var(--foreground)]"
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-medium text-[var(--muted)] ring-1 ring-[var(--border)] transition-colors hover:bg-[var(--foreground)]/[0.03] hover:text-[var(--foreground)]"
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Copy link
        </>
      )}
    </button>
  );
}
