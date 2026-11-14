"use client";

import { ReactNode, useEffect, Suspense } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder-domain.convex.cloud";

const convex = new ConvexReactClient(convexUrl);

function UserSynchronizer() {
  const { isSignedIn } = useAuth();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  useEffect(() => {
    if (isSignedIn) {
      getOrCreateUser().catch((err) => {
        console.warn("User sync warning:", err);
      });
    }
  }, [isSignedIn, getOrCreateUser]);

  return null;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />}>
      <ClerkProvider
        publishableKey={
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
          "pk_test_bGVuZGxvb3AtZGVtby1rZXkuY2xlcmsuYWNjb3VudHMuZGV2JA"
        }
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <UserSynchronizer />
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </Suspense>
  );
}
