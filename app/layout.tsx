import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LendLoop | Neighborhood Tool-Lending Board",
  description:
    "Borrow what you need. Lend what you don't. Community tool sharing with automated notifications and reminders.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8F9FA] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <ConvexClientProvider>
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
          <footer className="border-t border-zinc-200/80 bg-white dark:bg-zinc-950 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500">
            <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>&copy; 2026 LendLoop. All Rights Reserved.</p>
              <div className="flex items-center gap-4 text-zinc-400">
                <Link href="/privacy" className="hover:text-zinc-600">
                  Privacy
                </Link>
                <span>&bull;</span>
                <Link href="/terms" className="hover:text-zinc-600">
                  Terms
                </Link>
                <span>&bull;</span>
                <Link href="/sitemap.xml" className="hover:text-zinc-600">
                  Sitemap
                </Link>
              </div>
            </div>
          </footer>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
