"use client";

import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TOOL_CATEGORIES } from "@/lib/constants";
import { ToolDetailsDrawer } from "@/components/ToolDetailsDrawer";
import {
  Wrench,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  Eye,
} from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const publicTools = useQuery(api.tools.getPublicAvailableTools);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewingTool, setViewingTool] = useState<any>(null);

  const filteredTools = (publicTools ?? []).filter((tool: any) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-radial from-amber-500/10 via-zinc-900 to-zinc-950 p-8 sm:p-12 lg:p-16 shadow-xl text-center sm:text-left">
        <div className="relative z-10 max-w-3xl">

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Borrow what you need. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5B842] via-amber-200 to-white">
              Lend what you don&apos;t.
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            Save money, cut clutter, and empower your community. Access high-quality power tools, garden gear, camping equipment, and kitchen appliances directly from verified neighbors.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5B842] px-7 py-3.5 text-sm font-black text-zinc-950 shadow-md hover:bg-[#e6ab39] transition-all hover:scale-[1.02]"
              >
                Explore Community Tools
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5B842] px-7 py-3.5 text-sm font-black text-zinc-950 shadow-md hover:bg-[#e6ab39] transition-all hover:scale-[1.02]">
                  Sign in to lend or borrow
                  <ArrowRight className="h-4 w-4" />
                </button>
              </SignInButton>
            )}

            <div className="flex items-center gap-6 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F5B842]" />
                Free Community Sharing
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F5B842]" />
                Automated Reminders
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 h-96 w-96 rounded-full bg-[#F5B842]/15 blur-3xl pointer-events-none" />
      </div>

      {/* Directory Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Available Equipment Preview
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time public preview. Equipment details, owner credibility badges, and borrowing requests are available upon sign-in.
          </p>
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
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {tool.images && tool.images.length > 0 ? (
                            <img
                              src={tool.images[0]}
                              alt={tool.name}
                              className="h-9 w-9 shrink-0 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-2xs"
                            />
                          ) : (
                            <div className="h-9 w-9 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                              <Wrench className="h-4 w-4" />
                            </div>
                          )}
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {tool.name}
                          </span>
                        </div>
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingTool(tool)}
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
                            title="View Photos & Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </button>

                          {isSignedIn ? (
                            <Link
                              href="/dashboard"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:text-zinc-700"
                            >
                              Borrow &rarr;
                            </Link>
                          ) : (
                            <SignInButton mode="modal">
                              <button className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400">
                                Sign in &rarr;
                              </button>
                            </SignInButton>
                          )}
                        </div>
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

      {/* Tool Details Sidebar Drawer for Landing Page */}
      <ToolDetailsDrawer
        isOpen={!!viewingTool}
        onClose={() => setViewingTool(null)}
        tool={
          viewingTool
            ? {
                ...viewingTool,
                isAvailable: true,
              }
            : null
        }
      />
    </div>
  );
}
