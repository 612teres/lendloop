"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AutomationHistoryBadge } from "@/components/AutomationHistoryBadge";
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Users,
  Layers,
  AlertTriangle,
  Clock,
  Calendar,
} from "lucide-react";

export default function AdminPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const allUsers = useQuery(api.users.getAllUsers);
  const allTools = useQuery(api.tools.getAllTools, {});
  const allLoans = useQuery(api.loans.getAllLoansAdmin);

  const setTrustedLender = useMutation(api.users.setTrustedLender);
  const deleteTool = useMutation(api.tools.deleteTool);

  const [activeTab, setActiveTab] = useState<"users" | "listings" | "loans">("users");
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (currentUser === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="h-8 w-48 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Administrator Access Required
        </h1>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-950 dark:text-purple-300 mb-2">
            <Shield className="h-3 w-3" />
            Admin Control Center
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Neighborhood Governance & Audit
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Enforce safety standards, audit all loan transactions, and assign Trusted Lender credentials.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "users"
                ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Lenders ({allUsers?.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("listings")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "listings"
                ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            All Tools ({allTools?.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("loans")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "loans"
                ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            All Loans ({allLoans?.length ?? 0})
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900">
          {actionError}
        </div>
      )}
      {successMessage && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-xs text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
          {successMessage}
        </div>
      )}

      {/* Tab Panels */}
      <div className="mt-6">
        {/* Users / Trusted Lenders tab */}
        {activeTab === "users" && (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Community Members & Trusted Lender Management
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Toggle &ldquo;Trusted Lender&rdquo; status to display verified credibility badges on tools.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 font-semibold">User</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold">System Role</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {allUsers?.map((user: any) => (
                    <tr key={user._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {user.email || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isTrustedLender ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Trusted Lender
                          </span>
                        ) : (
                          <span className="text-zinc-400">Standard</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            handleToggleTrusted(user._id, !!user.isTrustedLender, user.name)
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                            user.isTrustedLender
                              ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                              : "bg-emerald-600 text-white hover:bg-emerald-500"
                          }`}
                        >
                          {user.isTrustedLender ? "Revoke Trust" : "Mark as Trusted"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Listings tab */}
        {activeTab === "listings" && (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Community Tool Listings Audit
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Admins have permissions to moderate and remove inappropriate or hazardous listings.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Tool</th>
                    <th className="px-6 py-3 font-semibold">Category</th>
                    <th className="px-6 py-3 font-semibold">Owner</th>
                    <th className="px-6 py-3 font-semibold">Availability</th>
                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {allTools?.map((tool: any) => (
                    <tr key={tool._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        {tool.name}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {tool.category}
                      </td>
                      <td className="px-6 py-4 text-zinc-800 dark:text-zinc-200">
                        {tool.ownerName}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            tool.isAvailable
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {tool.isAvailable ? "Available" : "Checked Out"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleAdminDeleteListing(tool._id, tool.name)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Loans tab */}
        {activeTab === "loans" && (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Master Loans Ledger & Automation Audit
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Full historical audit trail of all loan transactions and recent n8n workflow events.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Tool</th>
                    <th className="px-6 py-3 font-semibold">Borrower</th>
                    <th className="px-6 py-3 font-semibold">Lender</th>
                    <th className="px-6 py-3 font-semibold">Dates</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Recent Automation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {allLoans?.map((loan: any) => (
                    <tr key={loan._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        {loan.toolName}
                      </td>
                      <td className="px-6 py-4 text-zinc-800 dark:text-zinc-200">
                        {loan.borrowerName}
                      </td>
                      <td className="px-6 py-4 text-zinc-800 dark:text-zinc-200">
                        {loan.lenderName}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {loan.startDate} &rarr; {loan.endDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize font-semibold text-zinc-700 dark:text-zinc-300">
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <AutomationHistoryBadge log={loan.recentAutomation} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
