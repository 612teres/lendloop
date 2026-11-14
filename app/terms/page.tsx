import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | LendLoop",
  description: "Read the terms for using LendLoop's neighborhood lending board.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 text-zinc-700 dark:text-zinc-300">
      <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated: November 14, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-7">
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Using LendLoop
          </h2>
          <p className="mt-2">
            LendLoop helps community members list tools and coordinate borrowing
            requests. You must use an account you are authorized to access,
            provide accurate information, and use the service lawfully and
            respectfully. Keep your sign-in credentials secure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Listings and lending arrangements
          </h2>
          <p className="mt-2">
            You are responsible for the accuracy of listings you create and for
            having the right to lend the items described. A listing or request
            does not itself guarantee that a loan will occur. Members should
            agree directly on handoff, safe use, care, and return of an item
            before completing a loan.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Safety and responsibility
          </h2>
          <p className="mt-2">
            Members are responsible for inspecting items, following applicable
            safety instructions, and deciding whether an item is suitable for
            their needs. LendLoop does not inspect, certify, insure, or guarantee
            the condition, safety, availability, or suitability of listed items.
            Members arrange and manage exchanges at their own discretion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Community rules and administration
          </h2>
          <p className="mt-2">
            Do not post unlawful, misleading, or abusive content, misuse another
            member&apos;s information, or attempt to bypass access controls.
            Administrators may manage listings and access to help operate and
            protect the community service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Availability and changes
          </h2>
          <p className="mt-2">
            The service is provided as available and may change or be
            interrupted. LendLoop is a coordination tool and is not a party to
            agreements between members. To the extent permitted by applicable
            law, LendLoop is not responsible for loss, damage, injury, or
            disputes arising from member listings or exchanges.
          </p>
        </section>
      </div>
    </article>
  );
}
