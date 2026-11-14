"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TOOL_CATEGORIES, TOOL_CONDITIONS } from "@/lib/constants";
import { X, AlertCircle } from "lucide-react";

interface ToolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolToEdit?: {
    _id: Id<"tools">;
    name: string;
    category: string;
    condition: string;
    description: string;
  } | null;
  onSuccess?: () => void;
}

export function ToolFormModal({
  isOpen,
  onClose,
  toolToEdit,
  onSuccess,
}: ToolFormModalProps) {
  const isEditing = !!toolToEdit;

  const [name, setName] = useState(toolToEdit?.name || "");
  const [category, setCategory] = useState(toolToEdit?.category || TOOL_CATEGORIES[0]);
  const [condition, setCondition] = useState(toolToEdit?.condition || "Good");
  const [description, setDescription] = useState(toolToEdit?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createTool = useMutation(api.tools.createTool);
  const updateTool = useMutation(api.tools.updateTool);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter a tool name");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Please provide a brief description");
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing && toolToEdit) {
        await updateTool({
          toolId: toolToEdit._id,
          name: name.trim(),
          category,
          condition,
          description: description.trim(),
        });
      } else {
        await createTool({
          name: name.trim(),
          category,
          condition,
          description: description.trim(),
        });
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {isEditing ? "Edit Tool Listing" : "List a Tool to Lend"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Tool Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. DeWalt 20V Cordless Drill with Extra Battery"
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {TOOL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {TOOL_CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Short Description & Usage Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Include accessories, condition details, safety notes, or pickup preferences."
              required
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 shadow-2xs focus:border-[#F5B842] focus:outline-none focus:ring-1 focus:ring-[#F5B842] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-[#F5B842] px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-xs hover:bg-[#e6ab39] focus:outline-none focus:ring-2 focus:ring-[#F5B842] disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Listing"
                : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
