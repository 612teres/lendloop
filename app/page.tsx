"use client";

import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TOOL_CATEGORIES } from "@/lib/constants";
import {
  Wrench,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const publicTools = useQuery(api.tools.getPublicAvailableTools);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTools = (publicTools ?? []).filter((tool: any) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Tagline matching requirements */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
              Lend<span className="text-[#F5B842]">Loop</span>
            </h1>
            <span className="h-2 w-2 rounded-full bg-[#F5B842]" />
          </div>
          <p className="mt-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Borrow what you need. Lend what you don&apos;t.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Public equipment preview. Owner details and borrowing access are reserved for authenticated neighbors.
          </p>
        </div>

        <div>
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5B842] px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-xs hover:bg-[#e6ab39] transition-all hover:scale-[1.01]"
            >
              Open Tools Board
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5B842] px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-xs hover:bg-[#e6ab39] transition-all hover:scale-[1.01]">
                Sign in to lend or borrow
                <ArrowRight className="h-4 w-4" />
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Main Zeomart-style White Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search available tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white pl-4 pr-10 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-[#F5B842] focus:outline-none focus:ring-1 focus:ring-[#F5B842] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <Search className="absolute right-3.5 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>

            {/* Category Dropdown */}
            <div className="relative min-w-[170px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none rounded-xl border border-zinc-200 bg-white pl-4 pr-9 py-2.5 text-xs font-medium text-zinc-700 focus:border-[#F5B842] focus:outline-none focus:ring-1 focus:ring-[#F5B842] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <option value="All">Select Category</option>
                {TOOL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            <span>Read-only directory</span>
          </div>
        </div>

        {/* Read-Only Table (Name and Category only, no owner details) */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400">
                <th className="py-3 px-4 font-semibold rounded-l-lg">ID</th>
                <th className="py-3 px-4 font-semibold">Tool Name</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right rounded-r-lg">Borrow Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {publicTools === undefined ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={5} className="py-4 px-4">
                      <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    <Wrench className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                    <p className="mt-2 text-xs font-medium">
                      No available tools matching your criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTools.map((tool: any, index: number) => {
                  const displayId = `#${1000 + index + 1}`;

                  return (
                    <tr
                      key={tool._id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-zinc-400">
                        {displayId}
                      </td>
                      <td className="py-4 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        {tool.name}
                      </td>
                      <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400">
                        {tool.category}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center rounded-md bg-[#E6F4EA] px-2.5 py-1 text-[11px] font-semibold text-[#137333]">
                          Available
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {isSignedIn ? (
                          <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:text-zinc-700"
                          >
                            Request to Borrow &rarr;
                          </Link>
                        ) : (
                          <SignInButton mode="modal">
                            <button className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400">
                              Sign in to borrow &rarr;
                            </button>
                          </SignInButton>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination matching Zeomart */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-500">
            {filteredTools.length > 0
              ? `1 - ${filteredTools.length} of ${filteredTools.length} available tools listed`
              : "0 tools found"}
          </div>

          <div className="flex items-center gap-1.5">
            <button className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-full bg-[#F5B842] text-xs font-bold text-zinc-950 flex items-center justify-center">
              1
            </button>
            <button className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
