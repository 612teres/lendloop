import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | LendLoop",
  description: "Learn how LendLoop handles account, listing, and loan information.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 text-zinc-700 dark:text-zinc-300">
      <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated: November 14, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-7">
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Information LendLoop handles
          </h2>
          <p className="mt-2">
            LendLoop handles account details supplied through sign-in, such as
            your name and email address, along with the tool listings and
            borrowing requests you create. The service also stores records
            needed to manage loan status, prevent duplicate automation events,
            and show activity history.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            How information is used
          </h2>
          <p className="mt-2">
            Information is used to authenticate members, operate the community
            lending board, coordinate requests and returns, protect the service,
            and send operational notifications and reminders. Public visitors
            may see limited listing details; account and loan information is
            available only where needed to provide the service and enforce
            access permissions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Service providers and sharing
          </h2>
          <p className="mt-2">
            LendLoop uses Clerk for authentication and Convex for application
            data and backend functions. Configured automation workflows may
            process loan event details to deliver notifications and reminders.
            These providers handle information as needed to provide their
            services. LendLoop does not make member contact details public in
            the equipment preview.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Retention and security
          </h2>
          <p className="mt-2">
            Account, listing, loan, and audit information is retained as needed
            to operate the service and maintain its records. LendLoop uses
            authentication, permission checks, and data-minimizing public
            queries, but no online service can guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Your choices and contact
          </h2>
          <p className="mt-2">
            For questions about your information or to request an update, contact
            the LendLoop administrator through the community service. This
            policy may be updated as the service changes; the current version
            will be posted on this page.
          </p>
        </section>
      </div>
    </article>
  );
}
