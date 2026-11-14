"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AutomationHistoryBadge } from "@/components/AutomationHistoryBadge";
import {
  Inbox,
  Send,
  Check,
  X,
  RotateCcw,
  Calendar,
  AlertCircle,
  Clock,
  User,
} from "lucide-react";

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");

  const incomingRequests = useQuery(api.loans.getMyIncomingRequests);
  const myBorrowRequests = useQuery(api.loans.getMyBorrowRequests);

  const approveRequest = useMutation(api.loans.approveRequest);
  const declineRequest = useMutation(api.loans.declineRequest);
  const confirmReturn = useMutation(api.loans.confirmReturn);
  const cancelRequest = useMutation(api.loans.cancelRequest);

  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (loanId: any) => {
    try {
      setActionError(null);
      setProcessingId(loanId);
      await approveRequest({ loanId });
    } catch (err: any) {
      setActionError(err.message || "Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (loanId: any) => {
    try {
      setActionError(null);
      setProcessingId(loanId);
      await declineRequest({ loanId });
    } catch (err: any) {
      setActionError(err.message || "Failed to decline request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReturn = async (loanId: any) => {
    try {
      setActionError(null);
      setProcessingId(loanId);
      await confirmReturn({ loanId });
    } catch (err: any) {
      setActionError(err.message || "Failed to confirm return");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (loanId: any) => {
    if (!window.confirm("Are you sure you want to cancel this borrow request?")) {
      return;
    }
    try {
      setActionError(null);
      setProcessingId(loanId);
      await cancelRequest({ loanId });
    } catch (err: any) {
      setActionError(err.message || "Failed to cancel request");
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Approved / Active Loan
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="h-3 w-3" />
            Pending Approval
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Declined
          </span>
        );
      case "returned":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Completed / Returned
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Borrow & Loan Requests
        </h1>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Manage loan lifecycle: review incoming borrower requests and track your own borrowing activities.
        </p>

        {/* Tab navigation */}
        <div className="mt-6 flex border-b border-zinc-200 dark:border-zinc-800 gap-8">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "incoming"
                ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Inbox className="h-4 w-4" />
            Incoming Requests on My Tools
            {incomingRequests && incomingRequests.filter((r: any) => r.status === "pending").length > 0 && (
              <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.2 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {incomingRequests.filter((r: any) => r.status === "pending").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("outgoing")}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "outgoing"
                ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Send className="h-4 w-4" />
            My Requests to Borrow
            {myBorrowRequests && myBorrowRequests.filter((r: any) => r.status === "pending").length > 0 && (
              <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.2 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {myBorrowRequests.filter((r: any) => r.status === "pending").length}
              </span>
            )}
          </button>
        </div>
      </div>

      {actionError && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "incoming" ? (
          <div>
            {incomingRequests === undefined ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                ))}
              </div>
            ) : incomingRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
                <Inbox className="mx-auto h-10 w-10 text-zinc-400" />
                <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  No incoming requests
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  When neighbors request to borrow your listed tools, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map((loan: any) => (
                  <div
                    key={loan._id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                          {loan.toolName}
                        </h3>
                        {statusBadge(loan.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                        <span className="flex items-center gap-1 font-medium text-zinc-900 dark:text-zinc-200">
                          <User className="h-3.5 w-3.5 text-zinc-400" />
                          Borrower: {loan.borrowerName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          Dates: {loan.startDate} &rarr; {loan.endDate}
                        </span>
                      </div>

                      {loan.notes && (
                        <p className="text-xs text-zinc-500 italic mt-1">
                          &ldquo;{loan.notes}&rdquo;
                        </p>
                      )}

                      <div className="pt-2">
                        <AutomationHistoryBadge log={loan.recentAutomation} />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2 md:pt-0">
                      {loan.status === "pending" && (
                        <>
                          <button
                            disabled={processingId === loan._id}
                            onClick={() => handleApprove(loan._id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            disabled={processingId === loan._id}
                            onClick={() => handleDecline(loan._id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                            Decline
                          </button>
                        </>
                      )}

                      {loan.status === "approved" && (
                        <button
                          disabled={processingId === loan._id}
                          onClick={() => handleConfirmReturn(loan._id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-500 disabled:opacity-50 transition-colors"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Confirm Return
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {myBorrowRequests === undefined ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                ))}
              </div>
            ) : myBorrowRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
                <Send className="mx-auto h-10 w-10 text-zinc-400" />
                <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  No borrow requests yet
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Browse available tools in your community and send borrow requests.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myBorrowRequests.map((loan: any) => (
                  <div
                    key={loan._id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                          {loan.toolName}
                        </h3>
                        {statusBadge(loan.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                        <span className="flex items-center gap-1 font-medium text-zinc-900 dark:text-zinc-200">
                          <User className="h-3.5 w-3.5 text-zinc-400" />
                          Lender: {loan.lenderName}
                          {loan.isLenderTrusted && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-0.5">
                              (Trusted)
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          Dates: {loan.startDate} &rarr; {loan.endDate}
                        </span>
                      </div>

                      <div className="pt-2">
                        <AutomationHistoryBadge log={loan.recentAutomation} />
                      </div>
                    </div>

                    <div>
                      {loan.status === "pending" && (
                        <button
                          disabled={processingId === loan._id}
                          onClick={() => handleCancel(loan._id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40 disabled:opacity-50 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
