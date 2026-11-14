import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("RBAC and Ownership Enforcement", () => {
  interface User {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
    isTrustedLender: boolean;
  }

  interface Tool {
    id: string;
    name: string;
    category: string;
    condition: string;
    ownerId: string;
    isArchived: boolean;
  }

  interface Loan {
    id: string;
    toolId: string;
    borrowerId: string;
    lenderId: string;
    startDate: string;
    endDate: string;
    status: "pending" | "approved" | "declined" | "returned" | "cancelled";
  }

  interface OutboxEvent {
    eventId: string;
    eventType: string;
    loanId: string;
    payload: any;
  }

  // In-memory simulation of Convex state
  const users: User[] = [
    { id: "u_alice", email: "alice@example.com", name: "Alice", role: "user", isTrustedLender: false },
    { id: "u_bob", email: "bob@example.com", name: "Bob", role: "user", isTrustedLender: false },
    { id: "u_admin", email: "admin@lendloop.org", name: "Neighborhood Admin", role: "admin", isTrustedLender: true },
  ];

  const tools: Tool[] = [
    { id: "t_drill", name: "DeWalt Cordless Drill", category: "Power Tools", condition: "Like New", ownerId: "u_alice", isArchived: false },
  ];

  const loans: Loan[] = [];
  const outbox: OutboxEvent[] = [];

  function datesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
    return !(e1 < s2 || s1 > e2);
  }

  test("negative test: user cannot assign themselves admin role via client input", () => {
    const adminEmails = ["admin@lendloop.org"];

    function resolveRole(email: string, clientRequestedRole?: string) {
      // Server-side trusted resolution ignores clientRequestedRole
      if (adminEmails.includes(email.toLowerCase())) {
        return "admin";
      }
      return "user";
    }

    const hackerAttempt = resolveRole("bob@example.com", "admin");
    assert.equal(hackerAttempt, "user", "Client requested role must be ignored");

    const legitimateAdmin = resolveRole("admin@lendloop.org", "user");
    assert.equal(legitimateAdmin, "admin", "Configured admin email gets admin role");
  });

  test("negative test: normal user cannot grant Trusted Lender status", () => {
    function setTrustedLender(caller: User, targetUserId: string, isTrusted: boolean) {
      if (caller.role !== "admin") {
        throw new Error("Forbidden: Only administrators can grant or revoke Trusted Lender status");
      }
      const target = users.find((u) => u.id === targetUserId);
      if (target) target.isTrustedLender = isTrusted;
      return target;
    }

    const alice = users.find((u) => u.id === "u_alice")!;
    assert.throws(
      () => setTrustedLender(alice, "u_bob", true),
      /Forbidden: Only administrators/
    );

    const admin = users.find((u) => u.id === "u_admin")!;
    const updated = setTrustedLender(admin, "u_alice", true);
    assert.equal(updated?.isTrustedLender, true);
  });

  test("negative test: user cannot edit or delete another user's tool", () => {
    function updateTool(caller: User, toolId: string, name: string) {
      const tool = tools.find((t) => t.id === toolId);
      if (!tool) throw new Error("Not found");
      if (tool.ownerId !== caller.id && caller.role !== "admin") {
        throw new Error("Forbidden: You can only edit your own listings");
      }
      tool.name = name;
      return tool;
    }

    const bob = users.find((u) => u.id === "u_bob")!;
    assert.throws(
      () => updateTool(bob, "t_drill", "Hacked Drill"),
      /Forbidden: You can only edit your own listings/
    );

    // Alice (owner) can edit
    const alice = users.find((u) => u.id === "u_alice")!;
    const updated = updateTool(alice, "t_drill", "DeWalt 20V Max Hammer Drill");
    assert.equal(updated.name, "DeWalt 20V Max Hammer Drill");
  });

  test("admin can delete any listing, but normal users can only delete their own", () => {
    function deleteTool(caller: User, toolId: string) {
      const tool = tools.find((t) => t.id === toolId);
      if (!tool) throw new Error("Not found");
      if (tool.ownerId !== caller.id && caller.role !== "admin") {
        throw new Error("Forbidden: Cannot delete other user's listing");
      }
      tool.isArchived = true;
      return { success: true, deletedBy: caller.role };
    }

    const bob = users.find((u) => u.id === "u_bob")!;
    assert.throws(() => deleteTool(bob, "t_drill"), /Forbidden/);

    const admin = users.find((u) => u.id === "u_admin")!;
    const res = deleteTool(admin, "t_drill");
    assert.equal(res.success, true);
    assert.equal(res.deletedBy, "admin");

    // Un-archive for subsequent tests
    tools.find((t) => t.id === "t_drill")!.isArchived = false;
  });

  test("business rule: user cannot borrow their own tool", () => {
    function createLoanRequest(caller: User, toolId: string, s: string, e: string) {
      const tool = tools.find((t) => t.id === toolId);
      if (!tool) throw new Error("Not found");
      if (tool.ownerId === caller.id) {
        throw new Error("Forbidden: You cannot borrow your own tool");
      }
      return { success: true };
    }

    const alice = users.find((u) => u.id === "u_alice")!;
    assert.throws(
      () => createLoanRequest(alice, "t_drill", "2026-12-01", "2026-12-05"),
      /Forbidden: You cannot borrow your own tool/
    );
  });

  test("business rule: rejects overlapping approved loans and produces transactional outbox events", () => {
    function createRequest(borrower: User, toolId: string, startDate: string, endDate: string) {
      const tool = tools.find((t) => t.id === toolId);
      if (!tool) throw new Error("Not found");
      if (startDate > endDate) throw new Error("Invalid date range");

      // Check overlapping approved loans
      const overlap = loans.find(
        (l) => l.toolId === toolId && l.status === "approved" && datesOverlap(startDate, endDate, l.startDate, l.endDate)
      );
      if (overlap) {
        throw new Error("Tool already booked for an approved loan during dates");
      }

      const loan: Loan = {
        id: "l_" + (loans.length + 1),
        toolId,
        borrowerId: borrower.id,
        lenderId: tool.ownerId,
        startDate,
        endDate,
        status: "pending",
      };
      loans.push(loan);

      // Atomically insert into outbox
      outbox.push({
        eventId: "evt_" + Math.random().toString(36).substring(7),
        eventType: "loan_requested",
        loanId: loan.id,
        payload: { borrower: borrower.name, tool: tool.name },
      });

      return loan;
    }

    function approveRequest(lender: User, loanId: string) {
      const loan = loans.find((l) => l.id === loanId);
      if (!loan) throw new Error("Not found");
      if (loan.lenderId !== lender.id) {
        throw new Error("Forbidden: Only the tool owner can approve requests");
      }

      // Re-check overlap
      const overlap = loans.find(
        (l) => l.toolId === loan.toolId && l.id !== loan.id && l.status === "approved" && datesOverlap(loan.startDate, loan.endDate, l.startDate, l.endDate)
      );
      if (overlap) {
        throw new Error("Cannot approve: Overlaps with an already approved loan");
      }

      loan.status = "approved";

      outbox.push({
        eventId: "evt_" + Math.random().toString(36).substring(7),
        eventType: "loan_approved",
        loanId: loan.id,
        payload: { status: "approved" },
      });

      return loan;
    }

    const bob = users.find((u) => u.id === "u_bob")!;
    const alice = users.find((u) => u.id === "u_alice")!;

    // Bob requests drill for Dec 1 to Dec 5
    const loan1 = createRequest(bob, "t_drill", "2026-12-01", "2026-12-05");
    assert.equal(loan1.status, "pending");
    assert.equal(outbox.length, 1);
    assert.equal(outbox[0].eventType, "loan_requested");

    // Non-owner cannot approve
    assert.throws(() => approveRequest(bob, loan1.id), /Forbidden: Only the tool owner/);

    // Alice approves loan1
    approveRequest(alice, loan1.id);
    assert.equal(loan1.status, "approved");
    assert.equal(outbox.length, 2);
    assert.equal(outbox[1].eventType, "loan_approved");

    // Another user tries to request overlapping dates Dec 3 to Dec 7
    const charlie: User = { id: "u_charlie", email: "charlie@example.com", name: "Charlie", role: "user", isTrustedLender: false };
    assert.throws(
      () => createRequest(charlie, "t_drill", "2026-12-03", "2026-12-07"),
      /Tool already booked for an approved loan/
    );

    // Non-overlapping request succeeds (Dec 10 to Dec 12)
    const loan2 = createRequest(charlie, "t_drill", "2026-12-10", "2026-12-12");
    assert.equal(loan2.status, "pending");
  });

  test("business rule: only tool owner can confirm return", () => {
    function confirmReturn(caller: User, loanId: string) {
      const loan = loans.find((l) => l.id === loanId);
      if (!loan) throw new Error("Not found");
      if (loan.lenderId !== caller.id) {
        throw new Error("Forbidden: Only the tool owner can confirm return");
      }
      loan.status = "returned";
      return loan;
    }

    const bob = users.find((u) => u.id === "u_bob")!;
    const alice = users.find((u) => u.id === "u_alice")!;
    const loan1 = loans[0];

    // Borrower cannot confirm return on their own
    assert.throws(() => confirmReturn(bob, loan1.id), /Forbidden/);

    // Lender confirms return
    confirmReturn(alice, loan1.id);
    assert.equal(loan1.status, "returned");
  });
});
