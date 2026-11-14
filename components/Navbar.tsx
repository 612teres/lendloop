"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Wrench, Shield, CheckCircle, PlusCircle, Inbox, Layers } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);

  const isAdmin = currentUser?.role === "admin";
  const isTrusted = currentUser?.isTrustedLender;

  const navLinks = [
    { href: "/dashboard", label: "Browse Tools", icon: Layers },
    { href: "/listings", label: "My Listings", icon: PlusCircle },
    { href: "/requests", label: "Requests", icon: Inbox },
    ...(isAdmin ? [{ href: "/admin", label: "Admin Panel", icon: Shield }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Lend<span className="text-emerald-600 dark:text-emerald-400">Loop</span>
              </span>
              <p className="hidden sm:block text-[10px] font-medium text-zinc-500 dark:text-zinc-400 -mt-1">
                Neighborhood Tool-Lending
              </p>
            </div>
          </Link>

          {/* Nav links for authenticated users */}
          {isSignedIn && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right side authentication & badges */}
        <div className="flex items-center gap-3">
          {isLoaded && isSignedIn ? (
            <>
              {/* Role & Trust Badges */}
              {isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              )}
              {isTrusted && !isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle className="h-3 w-3" />
                  Trusted Lender
                </span>
              )}
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9",
                  },
                }}
              />
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors">
                Sign in to lend or borrow
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Mobile nav for signed in users */}
      {isSignedIn && (
        <div className="flex md:hidden overflow-x-auto border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 gap-2 bg-zinc-50 dark:bg-zinc-900/50">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
