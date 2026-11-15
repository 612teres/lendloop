import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ||
        process.env.CLERK_FRONTEND_API_URL ||
        "https://handy-hen-5923.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
