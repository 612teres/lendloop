"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  Shield,
  ChevronDown,
} from "lucide-react";

export default function SupportPage() {
  const { isSignedIn } = useUser();
  const { isAuthenticated } = useConvexAuth();

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );
  const isAdmin = currentUser?.role === "admin";

  const myTickets = useQuery(
    api.tickets.getMyTickets,
    isAuthenticated ? {} : "skip"
  );
  const allTicketsAdmin = useQuery(
    api.tickets.getAllTicketsAdmin,
    isAdmin ? {} : "skip"
  );

  const createTicket = useMutation(api.tickets.createTicket);
  const updateTicketStatus = useMutation(api.tickets.updateTicketStatus);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<"tool_issue" | "user_dispute" | "platform_bug" | "other">("tool_issue");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Admin note and status state
  const [selectedTicketId, setSelectedTicketId] = useState<any>(null);
  const [adminStatus, setAdminStatus] = useState<"open" | "in_review" | "resolved">("in_review");
  const [adminNote, setAdminNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (!subject.trim()) {
      setErrorMessage("Please enter a subject");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Please describe the issue or complaint");
      return;
    }

    try {
      setIsSubmitting(true);
      await createTicket({
        subject: subject.trim(),
        category,
        description: description.trim(),
      });
      setStatusMessage("Your support ticket has been submitted to the community admins.");
      setSubject("");
      setDescription("");
      setIsCreateOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminUpdate = async (ticketId: any) => {
    try {
      await updateTicketStatus({
        ticketId,
        status: adminStatus,
        adminNote: adminNote.trim() ? adminNote.trim() : undefined,
      });
      setSelectedTicketId(null);
      setAdminNote("");
    } catch (err: any) {
      alert(err.message || "Failed to update ticket");
    }
  };

  const categoryLabels = {
    tool_issue: "Tool Condition / Damage",
    user_dispute: "Neighbor / Loan Dispute",
    platform_bug: "Website Bug / Technical",
    other: "General Feedback / Other",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Community Support & Issue Resolution
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Report broken or missing tools, resolve loan disputes, or submit general platform feedback for administrators.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5B842] px-4 py-2 text-xs font-bold text-zinc-950 shadow-xs hover:bg-[#e6ab39] transition-all"
        >
          <Plus className="h-4 w-4" />
          Raise an Issue
        </button>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Create Ticket Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              Submit a Support Issue or Complaint
            </h3>

            {errorMessage && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Issue Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:border-[#F5B842] focus:outline-none focus:ring-1 focus:ring-[#F5B842]"
                >
                  <option value="tool_issue">Tool Condition / Damage</option>
                  <option value="user_dispute">Neighbor / Loan Dispute</option>
                  <option value="platform_bug">Website Bug / Technical Issue</option>
                  <option value="other">General Feedback / Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lawn mower blade broken upon pickup"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:border-[#F5B842] focus:outline-none focus:ring-1 focus:ring-[#F5B842]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Detailed Explanation
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide specific details, dates, or borrower/lender names involved so administrators can investigate..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:border-[#F5B842] focus:outline-none focus:ring-1 focus:ring-[#F5B842]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#F5B842] px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-[#e6ab39] disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Management Section (Visible to Admins) */}
      {isAdmin && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
              Admin Support Queue
            </h2>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            All complaints and user issues submitted across the neighborhood. Review details, update status, and attach resolution notes.
          </p>

          <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {!allTicketsAdmin || allTicketsAdmin.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                No support tickets currently in queue.
              </div>
            ) : (
              allTicketsAdmin.map((t: any) => (
                <div key={t._id} className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {t.subject}
                        </span>
                        <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
                          {categoryLabels[t.category as keyof typeof categoryLabels] || t.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Submitted by <span className="font-semibold text-zinc-700 dark:text-zinc-200">{t.userName}</span> ({t.userEmail}) on {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold w-fit ${
                        t.status === "resolved"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : t.status === "in_review"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                      }`}
                    >
                      {t.status === "resolved" ? "Resolved" : t.status === "in_review" ? "In Review" : "Open"}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">
                    {t.description}
                  </p>

                  {t.adminNote && (
                    <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60">
                      <strong>Admin Resolution Note:</strong> {t.adminNote}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {selectedTicketId === t._id ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full pt-2">
                        <select
                          value={adminStatus}
                          onChange={(e: any) => setAdminStatus(e.target.value)}
                          className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          <option value="open">Open</option>
                          <option value="in_review">In Review</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Attach resolution or follow-up note..."
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          className="flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 w-full sm:w-auto"
                        />
                        <button
                          onClick={() => handleAdminUpdate(t._id)}
                          className="rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-1.5 text-xs font-semibold hover:opacity-90"
                        >
                          Save Update
                        </button>
                        <button
                          onClick={() => setSelectedTicketId(null)}
                          className="rounded-lg text-zinc-500 hover:text-zinc-700 text-xs px-2 py-1.5"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedTicketId(t._id);
                          setAdminStatus(t.status);
                          setAdminNote(t.adminNote || "");
                        }}
                        className="text-xs font-semibold text-[#F5B842] hover:text-[#e6ab39]"
                      >
                        Take Action / Update Status →
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* User's Own Tickets List */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
          My Submitted Tickets
        </h2>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {!myTickets || myTickets.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              <LifeBuoy className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600 mb-2" />
              You haven&apos;t raised any support tickets yet. Click &ldquo;Raise an Issue&rdquo; above if you need assistance.
            </div>
          ) : (
            myTickets.map((ticket: any) => (
              <div key={ticket._id} className="py-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                      {ticket.subject}
                    </span>
                    <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
                      {categoryLabels[ticket.category as keyof typeof categoryLabels] || ticket.category}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold w-fit ${
                      ticket.status === "resolved"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : ticket.status === "in_review"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                    }`}
                  >
                    {ticket.status === "resolved" ? "Resolved" : ticket.status === "in_review" ? "In Review" : "Open"}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {ticket.description}
                </p>

                {ticket.adminNote && (
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
                    <strong>Admin Update:</strong> {ticket.adminNote}
                  </div>
                )}

                <div className="text-[10px] text-zinc-400">
                  Submitted {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
