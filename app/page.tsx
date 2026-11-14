"use client";

import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Wrench, ArrowRight, ShieldCheck, Clock, Zap, CheckCircle2, Search } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const publicTools = useQuery(api.tools.getPublicAvailableTools);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = (publicTools ?? []).filter((tool: any) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-zinc-950 py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            Neighborhood Tool Sharing &bull; Powered by n8n Automations
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
            Lend<span className="text-emerald-600 dark:text-emerald-400">Loop</span>
          </h1>

          <p className="mt-4 text-xl sm:text-2xl font-medium text-zinc-700 dark:text-zinc-300">
            Borrow what you need. Lend what you don&apos;t.
          </p>

          <p className="mt-3 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            A trusted community board where neighbors share lawnmowers, drills, camping gear, and kitchen essentials — backed by automated workflows and overdue reminders.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-all hover:scale-[1.02]"
              >
                Go to Tool Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-all hover:scale-[1.02]">
                  Sign in to lend or borrow
                  <ArrowRight className="h-4 w-4" />
                </button>
              </SignInButton>
            )}

            <a
              href="#available-tools"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              Browse Available Tools
            </a>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4 p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Neighborhood Trust & RBAC
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Role-based access control enforced server-side. Trusted lenders earn verified community status.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Transactional Outbox & n8n
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Loan requests trigger instant HMAC-signed webhook dispatches to n8n workflows for reliable delivery.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Automated Overdue Reminders
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Daily scheduled workflow polls overdue loans and sends idempotent reminders with tamper prevention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Public Read-Only Tool Directory */}
      <section id="available-tools" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Public Directory &bull; Read-Only Preview
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Available Tools in the Neighborhood
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Showing available tools (name and category only). Sign in to view full descriptions, owner details, and request loans.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Read-Only Table / Cards */}
        {publicTools === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse"
              />
            ))}
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
            <Wrench className="mx-auto h-8 w-8 text-zinc-400" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              No matching available tools
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Be the first neighbor to list a tool on LendLoop!
            </p>
            {!isSignedIn && (
              <div className="mt-4">
                <SignInButton mode="modal">
                  <button className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500">
                    Sign in to list a tool
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool: any) => (
              <div
                key={tool._id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {tool.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Available
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {tool.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    Owner details hidden
                  </span>
                  {isSignedIn ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                    >
                      Request <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <SignInButton mode="modal">
                      <button className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
                        Sign in to borrow <ArrowRight className="h-3 w-3" />
                      </button>
                    </SignInButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
