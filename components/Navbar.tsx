"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Wrench,
  Search,
  Bell,
  Mail,
  ExternalLink,
  Shield,
  Menu,
  X,
  LayoutGrid,
  Package,
  Inbox,
  Clock,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );
  const isAdmin = currentUser?.role === "admin";

  // Real-time notifications and incoming requests
  const incomingRequests = useQuery(
    api.loans.getMyIncomingRequests,
    isAuthenticated ? {} : "skip"
  );
  const notifications = useQuery(
    api.automations.getMyNotifications,
    isAuthenticated ? {} : "skip"
  );

  const pendingRequestsCount = (incomingRequests ?? []).filter(
    (req: any) => req.status === "pending"
  ).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { href: "/dashboard", label: "Tools Board", icon: LayoutGrid },
    { href: "/listings", label: "My Listings", icon: Package },
    { href: "/requests", label: "Requests", icon: Inbox },
    { href: "/support", label: "Support & Issues", icon: HelpCircle },
    ...(isAdmin ? [{ href: "/admin", label: "Admin Panel", icon: Shield }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950 px-4 sm:px-6 lg:px-8">
      <div className="flex h-full items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {isSignedIn && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          <Link href="/" className="flex items-center gap-1.5 group">
            <span className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
              Lend<span className="text-[#F5B842]">Loop</span>
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#F5B842]" />
          </Link>
        </div>

        {/* Center Search Input */}
        <div className="hidden sm:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search tools or categories..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 pl-4 pr-10 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-[#F5B842] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#F5B842] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 transition-all"
            />
            <Search className="absolute right-3.5 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Right Action Icons & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isSignedIn && (
            <div className="flex items-center gap-1 sm:gap-2 mr-1">
              <Link
                href="/dashboard"
                title="Explore Tools"
                className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>

              {/* Requests / Messages Button with Live Badge */}
              <Link
                href="/requests"
                title="Incoming Requests & Loans"
                className="relative rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
              >
                <Mail className="h-4 w-4" />
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F5B842] px-1 text-[10px] font-black text-zinc-950 ring-2 ring-white dark:ring-zinc-950">
                    {pendingRequestsCount}
                  </span>
                )}
              </Link>

              {/* Notifications Button with Popover */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  title="Automated Notifications & Reminders"
                  className={`relative rounded-full p-2 transition-colors ${
                    notificationsOpen
                      ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  {(notifications && notifications.length > 0) && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#F5B842]" />
                  )}
                </button>

                {/* Notifications Dropdown Card */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          Automation Activity
                        </span>
                        <span className="rounded-full bg-[#F5B842]/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                          n8n
                        </span>
                      </div>
                      <Link
                        href="/requests"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-[11px] font-medium text-amber-600 hover:text-amber-700 dark:text-[#F5B842]"
                      >
                        View all
                      </Link>
                    </div>

                    <div className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800 max-h-72 overflow-y-auto">
                      {!notifications || notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-zinc-400">
                          No recent automation notifications yet.
                        </div>
                      ) : (
                        notifications.map((n: any) => (
                          <div key={n._id} className="py-2.5 flex items-start gap-3">
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                              {n.workflowType === "overdue_reminder" ? (
                                <Clock className="h-3.5 w-3.5" />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                                {n.toolName}
                              </p>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                {n.details}
                              </p>
                              <span className="text-[10px] text-zinc-400">
                                {new Date(n.timestamp).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoaded && isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-9 w-9 ring-2 ring-zinc-200 dark:ring-zinc-800",
                },
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <button className="inline-flex items-center justify-center rounded-xl bg-[#F5B842] px-4 py-2 text-xs font-bold text-zinc-950 shadow-xs hover:bg-[#e6ab39] transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && isSignedIn && (
        <div className="lg:hidden fixed inset-x-0 top-16 bg-white border-b border-zinc-200 p-4 space-y-2 dark:bg-zinc-950 dark:border-zinc-800 shadow-lg z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? "bg-[#F5B842] text-zinc-950"
                    : "text-zinc-600 dark:text-zinc-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
