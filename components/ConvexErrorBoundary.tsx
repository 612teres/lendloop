"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, Terminal, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ConvexErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const isConvexMissingFunction =
        this.state.error?.message?.includes("Could not find public function") ||
        this.state.error?.message?.includes("Server Error");

      return (
        <div className="mx-auto my-12 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-zinc-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-zinc-100">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold">
                {isConvexMissingFunction
                  ? "Convex Backend Sync Required"
                  : "An unexpected error occurred"}
              </h3>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                {isConvexMissingFunction
                  ? "Your Next.js client is connected to Convex, but your local backend functions in convex/ have not been pushed to your Convex deployment yet."
                  : this.state.error?.message}
              </p>

              {isConvexMissingFunction && (
                <div className="mt-4 rounded-xl bg-zinc-900 p-4 text-xs font-mono text-emerald-400">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Run this in a separate terminal:</span>
                  </div>
                  <code>npx convex dev</code>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
