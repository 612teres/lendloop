"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ToolFormModal } from "@/components/ToolFormModal";
import { PlusCircle, Edit2, Trash2, Wrench, AlertCircle } from "lucide-react";

export default function MyListingsPage() {
  const myTools = useQuery(api.tools.getMyTools);
  const deleteTool = useMutation(api.tools.deleteTool);

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            My Tool Listings
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Manage your shared equipment. Track availability and update condition notes.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Tool
        </button>
      </div>

      {errorMessage && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Listings List */}
      <div className="mt-8">
        {myTools === undefined ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse"
              />
            ))}
          </div>
        ) : myTools.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
            <Wrench className="mx-auto h-10 w-10 text-zinc-400" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              You haven&apos;t listed any tools yet
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Lend tools you don&apos;t use daily and help out neighbors in your community.
            </p>
            <div className="mt-4">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                List your first tool
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myTools.map((tool: any) => (
              <div
                key={tool._id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {tool.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        tool.isAvailable
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          tool.isAvailable ? "bg-emerald-600" : "bg-amber-600"
                        }`}
                      />
                      {tool.isAvailable
                        ? "Available"
                        : `On loan until ${tool.activeLoanEndDate || "soon"}`}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {tool.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    Condition: <span className="font-medium text-zinc-700 dark:text-zinc-300">{tool.condition}</span>
                  </p>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setToolToEdit(tool)}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tool._id, tool.name)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
