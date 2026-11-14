"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TOOL_CATEGORIES, TOOL_CONDITIONS } from "@/lib/constants";
import { X, AlertCircle, UploadCloud, Trash2, Image as ImageIcon } from "lucide-react";

interface ToolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolToEdit?: {
    _id: Id<"tools">;
    name: string;
    category: string;
    condition: string;
    description: string;
    images?: string[];
    imageStorageIds?: Id<"_storage">[];
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

  // Existing storage IDs (from toolToEdit) and their preview URLs
  const [existingStorageIds, setExistingStorageIds] = useState<Id<"_storage">[]>(
    toolToEdit?.imageStorageIds || []
  );
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    toolToEdit?.images || []
  );

  // Newly selected files to upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createTool = useMutation(api.tools.createTool);
  const updateTool = useMutation(api.tools.updateTool);
  const generateUploadUrl = useMutation(api.tools.generateUploadUrl);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const totalCount = existingStorageIds.length + selectedFiles.length + files.length;
    if (totalCount > 3) {
      setErrorMessage("You can upload a maximum of 3 images per tool listing.");
      return;
    }

    const maxSizeBytes = 2 * 1024 * 1024; // 2MB
    for (const file of files) {
      if (file.size > maxSizeBytes) {
        setErrorMessage(`"${file.name}" exceeds the 2MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select an image under 2MB.`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrorMessage(`"${file.name}" is not a valid image file.`);
        return;
      }
    }

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingStorageIds((prev) => prev.filter((_, i) => i !== index));
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

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

      // Upload newly selected files directly to Convex file storage
      const uploadedStorageIds: Id<"_storage">[] = [];
      for (const file of selectedFiles) {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const { storageId } = await response.json();
        uploadedStorageIds.push(storageId);
      }

      const finalStorageIds = [...existingStorageIds, ...uploadedStorageIds].slice(0, 3);

      if (isEditing && toolToEdit) {
        await updateTool({
          toolId: toolToEdit._id,
          name: name.trim(),
          category,
          condition,
          description: description.trim(),
          images: finalStorageIds,
        });
      } else {
        await createTool({
          name: name.trim(),
          category,
          condition,
          description: description.trim(),
          images: finalStorageIds.length > 0 ? finalStorageIds : undefined,
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

          {/* Tool Images (Max 3, Max 2MB each) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Tool Images <span className="text-zinc-400 font-normal">(Up to 3 images, max 2MB each)</span>
              </label>
              <span className="text-[11px] font-medium text-zinc-500">
                {existingStorageIds.length + selectedFiles.length} / 3
              </span>
            </div>

            {/* Thumbnail Previews */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {/* Existing Images */}
              {existingImageUrls.map((url, idx) => (
                <div key={`existing-${idx}`} className="relative group aspect-square rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img src={url} alt={`Tool photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {/* Newly Selected Images */}
              {previewUrls.map((url, idx) => (
                <div key={`new-${idx}`} className="relative group aspect-square rounded-xl border border-amber-300 dark:border-amber-700 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img src={url} alt={`New upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(idx)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F5B842] text-zinc-950">
                    New
                  </span>
                </div>
              ))}

              {/* Add Image Slot */}
              {existingStorageIds.length + selectedFiles.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-[#F5B842] dark:hover:border-[#F5B842] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer bg-zinc-50/50 dark:bg-zinc-800/40"
                >
                  <UploadCloud className="h-5 w-5 mb-1" />
                  <span className="text-[10px] font-semibold">Upload Photo</span>
                  <span className="text-[9px] text-zinc-400">Max 2MB</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
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
