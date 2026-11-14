"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ShieldCheck, Calendar, Wrench } from "lucide-react";

interface ToolDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tool: {
    _id: any;
    name: string;
    category: string;
    condition: string;
    description: string;
    images?: string[];
    ownerName?: string;
    isTrustedLender?: boolean;
    isAvailable?: boolean;
    activeLoanEndDate?: string;
  } | null;
  onBorrow?: (tool: any) => void;
  isOwner?: boolean;
}

export function ToolDetailsDrawer({
  isOpen,
  onClose,
  tool,
  onBorrow,
  isOwner,
}: ToolDetailsDrawerProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !tool) return null;

  const images = tool.images && tool.images.length > 0 ? tool.images : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Tool Details
              </span>
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                  tool.isAvailable
                    ? "bg-[#E6F4EA] text-[#137333] dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-[#FCE8E6] text-[#C5221F] dark:bg-rose-950/60 dark:text-rose-300"
                }`}
              >
                {tool.isAvailable ? "Available" : "Currently Borrowed"}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Image Gallery with horizontal scroll/carousel */}
            <div>
              {images.length > 0 ? (
                <div className="space-y-3">
                  {/* Main Large Image */}
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <img
                      src={images[activeImageIndex] || images[0]}
                      alt={tool.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Navigation Arrows if multiple */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev === 0 ? images.length - 1 : prev - 1
                            )
                          }
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev === images.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Horizontal Scroll Thumbnails */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                            activeImageIndex === idx
                              ? "border-[#F5B842] ring-2 ring-[#F5B842]/30"
                              : "border-zinc-200 dark:border-zinc-700 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-4/3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  <Wrench className="h-10 w-10 mb-2 stroke-1 text-zinc-300 dark:text-zinc-600" />
                  <span className="text-xs">No photos attached for this tool</span>
                </div>
              )}
            </div>

            {/* Title & Metadata */}
            <div>
              <h2 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                {tool.name}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {tool.category}
                </span>
                <span className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Condition: {tool.condition}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Usage Instructions & Description
              </h3>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                {tool.description}
              </p>
            </div>

            {/* Lender Profile if available */}
            {tool.ownerName && (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Listed By Neighbor
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#F5B842]/20 flex items-center justify-center text-xs font-bold text-amber-800 dark:text-[#F5B842]">
                      {tool.ownerName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {tool.ownerName}
                    </span>
                  </div>

                  {tool.isTrustedLender && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Trusted Lender
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            {onBorrow && !isOwner ? (
              <button
                onClick={() => {
                  onClose();
                  onBorrow(tool);
                }}
                disabled={!tool.isAvailable}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5B842] py-3 text-xs font-bold text-zinc-950 shadow-xs hover:bg-[#e6ab39] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Calendar className="h-4 w-4" />
                {tool.isAvailable ? "Request to Borrow Tool" : "Currently Unavailable"}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-zinc-100 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Close Drawer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
