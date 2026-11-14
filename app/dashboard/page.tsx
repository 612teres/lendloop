"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TOOL_CATEGORIES } from "@/lib/constants";
import { ToolCard } from "@/components/ToolCard";
import { ToolFormModal } from "@/components/ToolFormModal";
import { Search, PlusCircle, Filter, Wrench } from "lucide-react";

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const tools = useQuery(api.tools.getAllTools, {
    category: selectedCategory === "All" ? undefined : selectedCategory,
    search: searchQuery ? searchQuery : undefined,
  });

  const categories = ["All", ...TOOL_CATEGORIES];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Neighborhood Tools Directory
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Explore shared resources in your community. Real-time availability derived from approved loan schedules.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          List a New Tool
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by tool name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-4 py-2.5 text-xs text-zinc-900 shadow-2xs placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="mt-8">
        {tools === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-44 rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse"
              />
            ))}
          </div>
        ) : tools.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
            <Wrench className="mx-auto h-10 w-10 text-zinc-400" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              No tools found
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Try adjusting your search query or category filter.
            </p>
            <div className="mt-4">
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Reset filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool: any) => (
              <ToolCard
                key={tool._id}
                tool={tool}
                currentUserId={currentUser?._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Tool Modal */}
      <ToolFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
