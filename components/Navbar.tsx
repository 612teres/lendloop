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
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );
  const isAdmin = currentUser?.role === "admin";

  const navItems = [
    { href: "/dashboard", label: "Tools Board", icon: LayoutGrid },
    { href: "/listings", label: "My Listings", icon: Package },
    { href: "/requests", label: "Requests", icon: Inbox },
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

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs transition-transform group-hover:scale-105">
              <Wrench className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
                Lend<span className="text-[#F5B842]">Loop</span>
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#F5B842]" />
            </div>
          </Link>
        </div>

        {/* Center Search Input (matching Zeomart header search) */}
        <div className="hidden sm:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search something..."
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
              <Link
                href="/requests"
                title="Requests & Messages"
                className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                <Mail className="h-4 w-4" />
              </Link>
              <button
                title="Notifications"
                className="relative rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#F5B842]" />
              </button>
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
