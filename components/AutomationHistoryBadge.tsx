"use client";

import { Bell, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

interface AutomationLog {
  workflowType: "request_notification" | "overdue_reminder";
  details: string;
  timestamp: number;
}

interface AutomationHistoryBadgeProps {
  log: AutomationLog | null | undefined;
}

export function AutomationHistoryBadge({ log }: AutomationHistoryBadgeProps) {
  if (!log) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
        <Clock className="h-3 w-3" />
        No recent automations
      </span>
    );
  }

  // Calculate relative time: e.g. "2 hours ago", "1 day ago"
  const diffMs = Date.now() - log.timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let timeAgo = "Just now";
  if (diffDays > 0) {
    timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else if (diffHours > 0) {
    timeAgo = `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffMinutes > 0) {
    timeAgo = `${diffMinutes}m ago`;
  }

  const isOverdueWorkflow = log.workflowType === "overdue_reminder";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium border ${
        isOverdueWorkflow
          ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
          : "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
      }`}
      title={log.details}
    >
      {isOverdueWorkflow ? (
        <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
      ) : (
        <Bell className="h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400" />
      )}
      <span className="truncate max-w-[200px]">
        {isOverdueWorkflow ? "Reminder sent" : "Notification sent"} ({timeAgo})
      </span>
    </div>
  );
}
