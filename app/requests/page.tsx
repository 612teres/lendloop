"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AutomationHistoryBadge } from "@/components/AutomationHistoryBadge";
import { useUser } from "@clerk/nextjs";
import {
  Search,
  Check,
  X,
  RotateCcw,
  Calendar,
  AlertCircle,
  Inbox,
  Send,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export default function RequestsPage() {
  const { isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const incomingRequests = useQuery(
    api.loans.getMyIncomingRequests,
    isSignedIn ? {} : "skip"
  );
  const myBorrowRequests = useQuery(
    api.loans.getMyBorrowRequests,
    isSignedIn ? {} : "skip"
  );

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
          <span className="inline-flex items-center rounded-md bg-[#E6F4EA] px-2.5 py-1 text-[11px] font-semibold text-[#137333] dark:bg-emerald-950/60 dark:text-emerald-300">
            Approved / Loan Active
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center rounded-md bg-[#E8F0FE] px-2.5 py-1 text-[11px] font-semibold text-[#1A73E8] dark:bg-blue-950/60 dark:text-blue-300">
            Pending
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Declined
          </span>
        );
      case "returned":
        return (
          <span className="inline-flex items-center rounded-md bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
            Returned
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const currentList = activeTab === "incoming" ? incomingRequests : myBorrowRequests;

  const filteredLoans = (currentList ?? []).filter((loan: any) => {
    const matchesSearch =
      loan.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loan.borrowerName && loan.borrowerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (loan.lenderName && loan.lenderName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "All" || loan.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Borrow & Loan Requests
        </h1>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Review incoming requests on your equipment, approve or decline, and monitor loan return statuses.
        </p>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Zeomart-style White Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Tab & Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          {/* Tab Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("incoming")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "incoming"
                  ? "bg-[#F5B842] text-zinc-950 shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              <Inbox className="h-4 w-4" />
              Incoming Requests
              {incomingRequests &&
                incomingRequests.filter((r: any) => r.status === "pending").length > 0 && (
                  <span className="ml-1 rounded-full bg-zinc-950 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {incomingRequests.filter((r: any) => r.status === "pending").length}
                  </span>
                )}
            </button>

            <button
              onClick={() => setActiveTab("outgoing")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "outgoing"
                  ? "bg-[#F5B842] text-zinc-950 shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              <Send className="h-4 w-4" />
              My Requests
            </button>
          </div>

          {/* Search + Status Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white pl-4 pr-10 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-[#F5B842] focus:outline-none focus:ring-1 focus:ring-[#F5B842] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <Search className="absolute right-3.5 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>

            <div className="relative min-w-[130px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-zinc-200 bg-white pl-4 pr-9 py-2.5 text-xs font-medium text-zinc-700 focus:border-[#F5B842] focus:outline-none focus:ring-1 focus:ring-[#F5B842] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <option value="All">Status: All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Returned">Returned</option>
                <option value="Declined">Declined</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400">
                <th className="py-3 px-4 font-semibold rounded-l-lg">ID</th>
                <th className="py-3 px-4 font-semibold">Tool</th>
                <th className="py-3 px-4 font-semibold">
                  {activeTab === "incoming" ? "Borrower" : "Lender"}
                </th>
                <th className="py-3 px-4 font-semibold">Dates</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Automation Activity</th>
                <th className="py-3 px-4 font-semibold text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {currentList === undefined ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-4 px-4">
                      <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <p className="text-xs font-medium">
                      {activeTab === "incoming"
                        ? "No incoming requests on your tools."
                        : "You haven't requested any tools yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan: any, index: number) => {
                  const displayId = `#REQ-${100 + index + 1}`;

                  return (
                    <tr
                      key={loan._id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-zinc-400">
                        {displayId}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {loan.toolName}
                        </div>
                        {loan.notes && (
                          <div className="text-[11px] text-zinc-400 italic max-w-xs truncate">
                            &ldquo;{loan.notes}&rdquo;
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                        {activeTab === "incoming"
                          ? loan.borrowerName
                          : loan.lenderName}
                      </td>
                      <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {loan.startDate} &rarr; {loan.endDate}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {statusBadge(loan.status)}
                      </td>
                      <td className="py-4 px-4">
                        <AutomationHistoryBadge log={loan.recentAutomation} />
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {activeTab === "incoming" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {loan.status === "pending" && (
                              <>
                                <button
                                  disabled={processingId === loan._id}
                                  onClick={() => handleApprove(loan._id)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-[#F5B842] px-3 py-1.5 text-xs font-bold text-zinc-950 shadow-2xs hover:bg-[#e6ab39] transition-colors"
                                >
                                  <Check className="h-3 w-3" />
                                  Approve
                                </button>
                                <button
                                  disabled={processingId === loan._id}
                                  onClick={() => handleDecline(loan._id)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                  Decline
                                </button>
                              </>
                            )}
                            {loan.status === "approved" && (
                              <button
                                disabled={processingId === loan._id}
                                onClick={() => handleConfirmReturn(loan._id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Confirm Return
                              </button>
                            )}
                          </div>
                        ) : (
                          <div>
                            {loan.status === "pending" && (
                              <button
                                disabled={processingId === loan._id}
                                onClick={() => handleCancel(loan._id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                                Cancel
                              </button>
                            )}
                          </div>
                        )}
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
            {filteredLoans.length > 0
              ? `1 - ${filteredLoans.length} of ${filteredLoans.length} requests`
              : "0 requests"}
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
    </div>
  );
}
