import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-5 text-center">
      {/* Subtle gradient glow behind the 404 */}
      <div
        className="pointer-events-none absolute h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{
          background: "linear-gradient(135deg, #a855f7, #ec4899)",
        }}
        aria-hidden
      />

      <h1 className="relative text-[8rem] font-bold leading-none tracking-tighter sm:text-[10rem]">
        <span className="bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
          404
        </span>
      </h1>

      <p className="mt-4 max-w-md text-lg text-[var(--muted)]">
        This event doesn&apos;t exist &mdash; or it already happened.
      </p>

      <Link
        href="/dashboard"
        className="mt-8 inline-flex items-center gap-1 rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-[var(--background)] shadow-sm transition-all hover:shadow-md hover:-translate-y-px"
      >
        Browse events
        <span aria-hidden>&rarr;</span>
      </Link>
    </main>
  );
}
