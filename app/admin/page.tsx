"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AutomationHistoryBadge } from "@/components/AutomationHistoryBadge";
import { useUser } from "@clerk/nextjs";
import {
  Shield,
  CheckCircle2,
  Trash2,
  Users,
  Layers,
  AlertTriangle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminPage() {
  const { isSignedIn } = useUser();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isSignedIn ? {} : "skip"
  );
  const isAdmin = currentUser?.role === "admin";

  const allUsers = useQuery(api.users.getAllUsers, isAdmin ? {} : "skip");
  const allTools = useQuery(api.tools.getAllTools, isAdmin ? {} : "skip");
  const allLoans = useQuery(api.loans.getAllLoansAdmin, isAdmin ? {} : "skip");

  const setTrustedLender = useMutation(api.users.setTrustedLender);
  const deleteTool = useMutation(api.tools.deleteTool);

  const [activeTab, setActiveTab] = useState<"users" | "listings" | "loans">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (currentUser === undefined) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="h-40 rounded-2xl bg-white dark:bg-zinc-900 animate-pulse" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="p-12 max-w-md mx-auto text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-zinc-950 dark:text-zinc-100">
          Administrator Access Required
        </h1>
        <p className="mt-2 text-xs text-zinc-500">
          You do not have administrative permissions to view this panel. Roles are managed through trusted server configuration.
        </p>
      </div>
    );
  }

  const handleToggleTrusted = async (userId: any, currentStatus: boolean, userName: string) => {
    try {
      setActionError(null);
      setSuccessMessage(null);
      await setTrustedLender({
        userId,
        isTrusted: !currentStatus,
      });
      setSuccessMessage(
        `${userName} is now ${!currentStatus ? "marked as a Trusted Lender" : "a regular lender"}`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setActionError(err.message || "Failed to update trusted lender status");
    }
  };

  const handleAdminDeleteListing = async (toolId: any, toolName: string) => {
    if (
      !window.confirm(
        `ADMIN ACTION: Are you sure you want to remove listing "${toolName}"?`
      )
    ) {
      return;
    }

    try {
      setActionError(null);
      setSuccessMessage(null);
      await deleteTool({ toolId });
      setSuccessMessage(`Listing "${toolName}" has been removed by admin`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setActionError(err.message || "Failed to delete listing");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-950 dark:text-purple-300 mb-2">
          <Shield className="h-3 w-3" />
          Admin Governance
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Neighborhood Governance & Audit
        </h1>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Enforce safety standards, audit all loan transactions, and manage Trusted Lender credentials.
        </p>
      </div>

      {actionError && (
        <div className="rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-200">
          {actionError}
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl bg-emerald-50 p-4 text-xs text-emerald-700 border border-emerald-200">
          {successMessage}
        </div>
      )}

      {/* Main Zeomart-style White Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Toolbar & Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          {/* Golden Amber Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "users"
                  ? "bg-[#F5B842] text-zinc-950 shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              <Users className="h-4 w-4" />
              Lenders ({allUsers?.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab("listings")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "listings"
                  ? "bg-[#F5B842] text-zinc-950 shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              <Layers className="h-4 w-4" />
              All Tools ({allTools?.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab("loans")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "loans"
                  ? "bg-[#F5B842] text-zinc-950 shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              <Clock className="h-4 w-4" />
              All Loans ({allLoans?.length ?? 0})
            </button>
          </div>

          {/* Search filter */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Filter records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white pl-4 pr-10 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-[#F5B842] focus:outline-none focus:ring-1 focus:ring-[#F5B842] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <Search className="absolute right-3.5 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Tab 1: Users / Trusted Lenders */}
        {activeTab === "users" && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400">
                  <th className="py-3 px-4 font-semibold rounded-l-lg">ID</th>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Trust Status</th>
                  <th className="py-3 px-4 font-semibold text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {allUsers
                  ?.filter(
                    (u: any) =>
                      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.email.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((user: any, index: number) => {
                    const displayId = `#USR-${100 + index + 1}`;
                    return (
                      <tr
                        key={user._id}
                        className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-zinc-400">
                          {displayId}
                        </td>
                        <td className="py-4 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                          {user.name}
                        </td>
                        <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400">
                          {user.email || "—"}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {user.isTrustedLender ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#E6F4EA] px-2.5 py-1 text-[11px] font-semibold text-[#137333]">
                              <CheckCircle2 className="h-3 w-3" />
                              Trusted Lender
                            </span>
                          ) : (
                            <span className="text-zinc-400">Standard</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() =>
                              handleToggleTrusted(
                                user._id,
                                !!user.isTrustedLender,
                                user.name
                              )
                            }
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              user.isTrustedLender
                                ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                : "bg-[#F5B842] text-zinc-950 font-bold hover:bg-[#e6ab39]"
                            }`}
                          >
                            {user.isTrustedLender ? "Revoke Trust" : "Mark Trusted"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Listings Moderation */}
        {activeTab === "listings" && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400">
                  <th className="py-3 px-4 font-semibold rounded-l-lg">ID</th>
                  <th className="py-3 px-4 font-semibold">Tool</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Owner</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {allTools
                  ?.filter(
                    (t: any) =>
                      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((tool: any, index: number) => {
                    const displayId = `#${1000 + index + 1}`;
                    return (
                      <tr
                        key={tool._id}
                        className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-zinc-400">
                          {displayId}
                        </td>
                        <td className="py-4 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                          {tool.name}
                        </td>
                        <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400">
                          {tool.category}
                        </td>
                        <td className="py-4 px-4 text-zinc-800 dark:text-zinc-200">
                          {tool.ownerName}
                        </td>
                        <td className="py-4 px-4">
                          {tool.isAvailable ? (
                            <span className="inline-flex rounded-md bg-[#E6F4EA] px-2.5 py-1 text-[11px] font-semibold text-[#137333]">
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex rounded-md bg-[#FCE8E6] px-2.5 py-1 text-[11px] font-semibold text-[#C5221F]">
                              Booked
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() =>
                              handleAdminDeleteListing(tool._id, tool.name)
                            }
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Admin Remove Listing"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Master Loans Ledger */}
        {activeTab === "loans" && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400">
                  <th className="py-3 px-4 font-semibold rounded-l-lg">ID</th>
                  <th className="py-3 px-4 font-semibold">Tool</th>
                  <th className="py-3 px-4 font-semibold">Borrower</th>
                  <th className="py-3 px-4 font-semibold">Lender</th>
                  <th className="py-3 px-4 font-semibold">Dates</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold rounded-r-lg">Recent Automation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {allLoans
                  ?.filter(
                    (l: any) =>
                      l.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      l.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      l.lenderName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((loan: any, index: number) => {
                    const displayId = `#LOAN-${200 + index + 1}`;
                    return (
                      <tr
                        key={loan._id}
                        className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-zinc-400">
                          {displayId}
                        </td>
                        <td className="py-4 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                          {loan.toolName}
                        </td>
                        <td className="py-4 px-4 text-zinc-800 dark:text-zinc-200">
                          {loan.borrowerName}
                        </td>
                        <td className="py-4 px-4 text-zinc-800 dark:text-zinc-200">
                          {loan.lenderName}
                        </td>
                        <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {loan.startDate} &rarr; {loan.endDate}
                        </td>
                        <td className="py-4 px-4 capitalize font-semibold text-zinc-700">
                          {loan.status}
                        </td>
                        <td className="py-4 px-4">
                          <AutomationHistoryBadge log={loan.recentAutomation} />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Pagination */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-500">
            Records displayed for community administration
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
