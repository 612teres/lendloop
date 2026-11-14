"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TOOL_CATEGORIES } from "@/lib/constants";
import { ToolFormModal } from "@/components/ToolFormModal";
import { useUser } from "@clerk/nextjs";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wrench,
  AlertCircle,
} from "lucide-react";

export default function MyListingsPage() {
  const { isSignedIn } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const myTools = useQuery(api.tools.getMyTools, isAuthenticated ? {} : "skip");
  const deleteTool = useMutation(api.tools.deleteTool);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toolToEdit, setToolToEdit] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async (toolId: any, toolName: string) => {
    if (!window.confirm(`Are you sure you want to remove the listing for "${toolName}"?`)) {
      return;
    }

    try {
      setErrorMessage(null);
      await deleteTool({ toolId });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to remove listing");
    }
  };

  const filteredTools = (myTools ?? []).filter((tool: any) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          My Tool Listings
        </h1>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Manage your equipment, monitor borrowing availability, and update usage notes.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Zeomart-style White Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search my tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white pl-4 pr-10 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-[#F5B842] focus:outline-none focus:ring-1 focus:ring-[#F5B842] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <Search className="absolute right-3.5 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>

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
              <tr className="bg-[#F8FAFC] dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400">
                <th className="py-3 px-4 font-semibold rounded-l-lg">ID</th>
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Condition</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {myTools === undefined ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-4">
                      <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Wrench className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                    <p className="mt-2 text-xs font-medium text-zinc-500">
                      No tools listed yet.
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#F5B842] px-3.5 py-1.5 text-xs font-semibold text-zinc-950"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      List your first tool
                    </button>
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
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 max-w-xs truncate">
                          {tool.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 max-w-xs truncate mt-0.5">
                          {tool.description}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400">
                        {tool.category}
                      </td>
                      <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400">
                        {tool.condition}
                      </td>
                      <td className="py-4 px-4">
                        {tool.isAvailable ? (
                          <span className="inline-flex items-center rounded-md bg-[#E6F4EA] px-2.5 py-1 text-[11px] font-semibold text-[#137333] dark:bg-emerald-950/60 dark:text-emerald-300">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-[#FCE8E6] px-2.5 py-1 text-[11px] font-semibold text-[#C5221F] dark:bg-rose-950/60 dark:text-rose-300">
                            On loan until {tool.activeLoanEndDate || "soon"}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setToolToEdit(tool)}
                            title="Edit Tool"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tool._id, tool.name)}
                            title="Remove Listing"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-500">
            {filteredTools.length > 0
              ? `1 - ${filteredTools.length} of ${filteredTools.length} tools listed`
              : "0 tools listed"}
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

      {/* Add / Edit Modals */}
      <ToolFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <ToolFormModal
        isOpen={!!toolToEdit}
        toolToEdit={toolToEdit}
        onClose={() => setToolToEdit(null)}
      />
    </div>
  );
}
