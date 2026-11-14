"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TOOL_CATEGORIES } from "@/lib/constants";
import { ToolFormModal } from "@/components/ToolFormModal";
import { RequestModal } from "@/components/RequestModal";
import { AutomationHistoryBadge } from "@/components/AutomationHistoryBadge";
import { useUser } from "@clerk/nextjs";
import {
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Wrench,
} from "lucide-react";

export default function DashboardPage() {
  const { isSignedIn } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [borrowModalTool, setBorrowModalTool] = useState<{ id: any; name: string } | null>(null);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isSignedIn ? {} : "skip"
  );
  const tools = useQuery(
    api.tools.getAllTools,
    isSignedIn
      ? {
          category: selectedCategory === "All" ? undefined : selectedCategory,
          search: searchQuery ? searchQuery : undefined,
        }
      : "skip"
  );

  // Filter by status if selected
  const filteredTools = (tools ?? []).filter((tool: any) => {
    if (selectedStatus === "Available") return tool.isAvailable;
    if (selectedStatus === "Booked") return !tool.isAvailable;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Tools Directory
        </h1>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Borrow what you need. Lending schedules and real-time availability derived from community reservations.
        </p>
      </div>

      {/* Main Zeomart-style White Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Toolbar: Search + Category + Status + Add Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            {/* Search input with right icon */}
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white pl-4 pr-10 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-[#F5B842] focus:outline-none focus:ring-1 focus:ring-[#F5B842] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <Search className="absolute right-3.5 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>

            {/* Select Category Dropdown */}
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

            {/* Select Status Dropdown */}
            <div className="relative min-w-[140px]">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none rounded-xl border border-zinc-200 bg-white pl-4 pr-9 py-2.5 text-xs font-medium text-zinc-700 focus:border-[#F5B842] focus:outline-none focus:ring-1 focus:ring-[#F5B842] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <option value="All">Status</option>
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Add New Tool Button (Amber Pill) */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5B842] px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-xs hover:bg-[#e6ab39] transition-all hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Add New Tool
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 rounded-lg">
                <th className="py-3 px-4 font-semibold rounded-l-lg">ID</th>
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Condition</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Owner</th>
                <th className="py-3 px-4 font-semibold text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {tools === undefined ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-4 px-4">
                      <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Wrench className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                    <p className="mt-2 text-xs font-medium text-zinc-500">
                      No matching tools found.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTools.map((tool: any, index: number) => {
                  const isOwner = currentUser?._id === tool.ownerId;
                  const displayId = `#${1000 + index + 1}`;

                  return (
                    <tr
                      key={tool._id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-4 px-4 font-medium text-zinc-400">
                        {displayId}
                      </td>

                      {/* Name */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 max-w-xs truncate">
                          {tool.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 max-w-xs truncate mt-0.5">
                          {tool.description}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400">
                        {tool.category}
                      </td>

                      {/* Condition */}
                      <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400">
                        {tool.condition}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {tool.isAvailable ? (
                          <span className="inline-flex items-center rounded-md bg-[#E6F4EA] px-2.5 py-1 text-[11px] font-semibold text-[#137333] dark:bg-emerald-950/60 dark:text-emerald-300">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-[#FCE8E6] px-2.5 py-1 text-[11px] font-semibold text-[#C5221F] dark:bg-rose-950/60 dark:text-rose-300">
                            Booked
                          </span>
                        )}
                      </td>

                      {/* Owner */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                          <span>{tool.ownerName}</span>
                          {tool.isTrustedLender && (
                            <span title="Trusted Lender">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        {isOwner ? (
                          <span className="text-[11px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                            Your Tool
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              setBorrowModalTool({ id: tool._id, name: tool.name })
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-[#F5B842] px-3 py-1.5 text-xs font-semibold text-zinc-950 shadow-2xs hover:bg-[#e6ab39] transition-colors"
                          >
                            <Calendar className="h-3 w-3" />
                            Borrow
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination / Count matching Zeomart design */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-500">
            {filteredTools.length > 0
              ? `1 - ${filteredTools.length} of ${filteredTools.length} tools found`
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

      {/* Modals */}
      <ToolFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {borrowModalTool && (
        <RequestModal
          toolId={borrowModalTool.id}
          toolName={borrowModalTool.name}
          isOpen={true}
          onClose={() => setBorrowModalTool(null)}
        />
      )}
    </div>
  );
}
