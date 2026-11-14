"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle2, Shield, Calendar, User, Clock, AlertCircle } from "lucide-react";
import { RequestModal } from "./RequestModal";

interface ToolCardProps {
  tool: {
    _id: any;
    name: string;
    category: string;
    condition: string;
    description: string;
    ownerId: string;
    ownerName: string;
    isTrustedLender: boolean;
    isAvailable: boolean;
    currentLoanEndDate?: string;
  };
  currentUserId?: string;
}

export function ToolCard({ tool, currentUserId }: ToolCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isOwner = currentUserId && tool.ownerId === currentUserId;

  return (
    <>
      <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700">
        <div>
          {/* Top category & availability row */}
          <div className="flex items-center justify-between gap-2 mb-3">
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
                  tool.isAvailable ? "bg-emerald-600 dark:bg-emerald-400" : "bg-amber-600 dark:bg-amber-400"
                }`}
              />
              {tool.isAvailable
                ? "Available"
                : `Booked until ${tool.currentLoanEndDate || "soon"}`}
            </span>
          </div>

          {/* Tool Title */}
          <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {tool.name}
          </h4>

          {/* Condition tag */}
          <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Condition: <span className="text-zinc-700 dark:text-zinc-300">{tool.condition}</span>
          </p>

          {/* Description */}
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {tool.description}
          </p>
        </div>

        {/* Footer with owner and borrow action */}
        <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 text-[10px] font-semibold">
              {tool.ownerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[110px]">
                  {tool.ownerName}
                </span>
                {tool.isTrustedLender && (
                  <span
                    title="Trusted Lender"
                    className="inline-flex text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-100 dark:fill-emerald-950" />
                  </span>
                )}
              </div>
            </div>
          </div>

          {isOwner ? (
            <span className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              Your Listing
            </span>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            >
              <Calendar className="h-3.5 w-3.5" />
              Borrow
            </button>
          )}
        </div>
      </div>

      <RequestModal
        toolId={tool._id}
        toolName={tool.name}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
