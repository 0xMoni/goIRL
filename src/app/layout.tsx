import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "goIRL · Tech events worth showing up to",
  description:
    "Hackathons, meetups and workshops across India and online — where you'll learn something AND meet your people.",
  openGraph: {
    title: "goIRL",
    description:
      "Tech events worth showing up to. Hackathons, meetups, workshops across India and online.",
    type: "website",
  },
};

// Prevents flash-of-wrong-theme on initial paint when the user hasn't yet
// set an explicit preference — relies on matchMedia synchronously at head.
const NO_FLASH_SCRIPT = `(function(){try{var t=document.cookie.match(/ite_theme=(dark|light)/);if(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const theme = jar.get("ite_theme")?.value;
  const htmlClass = `${geistSans.variable} ${geistMono.variable} h-full antialiased${theme === "dark" ? " dark" : ""}`;

  return (
    <html lang="en" className={htmlClass} suppressHydrationWarning>
      <head>
        {!theme && (
          <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
        )}
      </head>
      <body className="min-h-full bg-[var(--background)] font-sans text-[var(--foreground)]">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
