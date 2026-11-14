"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Wrench,
  LayoutGrid,
  Package,
  Inbox,
  Send,
  Shield,
  LogOut,
  CheckCircle,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const isAdmin = currentUser?.role === "admin";
  const isTrusted = currentUser?.isTrustedLender;

  const navItems = [
    { href: "/dashboard", label: "Tools Board", icon: LayoutGrid },
    { href: "/listings", label: "My Listings", icon: Package },
    { href: "/requests", label: "Requests", icon: Inbox },
    ...(isAdmin ? [{ href: "/admin", label: "Admin Panel", icon: Shield }] : []),
  ];

  if (!isSignedIn) {
    return null;
  }

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-zinc-200/80 bg-white min-h-[calc(100vh-64px)] p-4 shrink-0 dark:border-zinc-800 dark:bg-zinc-950">
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[#F5B842] text-zinc-950 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Status Card */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
        {currentUser && (
          <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Role
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isAdmin
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {isAdmin ? "Admin" : "Neighbor"}
              </span>
            </div>
            {isTrusted && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Trusted Lender</span>
              </div>
            )}
          </div>
        )}

        <SignOutButton>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900 transition-colors">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
