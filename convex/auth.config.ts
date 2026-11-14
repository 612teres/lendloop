import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Domain of the Clerk JWT issuer
      // Supports process.env.CLERK_JWT_ISSUER_DOMAIN or process.env.CLERK_FRONTEND_API_URL,
      // falling back to the configured Clerk application domain.
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ||
        process.env.CLERK_FRONTEND_API_URL ||
        "https://handy-hen-5923.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
