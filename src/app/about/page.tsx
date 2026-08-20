import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — TournyPlay",
  description:
    "Learn what TournyPlay is, how it works, and the team behind eFootball Mobile 1v1 token rooms.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">About Us</h1>
      <p className="mt-1 text-ink-dim">
        Why we built TournyPlay, and what we&apos;re trying to do.
      </p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="font-display text-xl font-bold text-ink">
            Who we are
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-dim">
            TournyPlay is a community platform for eFootball Mobile players
            who want more than a casual kickabout. We built it for players
            who want their skills to actually mean something — stake tokens,
            challenge an opponent 1v1, and let the result decide who takes
            the pot.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink">
            What we do
          </h2>
          <ul className="mt-3 space-y-2.5 text-sm text-ink-dim">
            <li>
              <span className="font-semibold text-ink">
                Create or join rooms.
              </span>{" "}
              Set a token stake, get matched with an opponent, and settle it
              on the pitch in eFootball Mobile.
            </li>
            <li>
              <span className="font-semibold text-ink">Fair reporting.</span>{" "}
              Results are reported by the winner and confirmed by the loser,
              with clear rules and full refunds if a match never happens.
            </li>
            <li>
              <span className="font-semibold text-ink">
                A real leaderboard.
              </span>{" "}
              Every match feeds into rankings, so consistent players get
              recognized.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink">
            Our approach
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-dim">
            TournyPlay doesn&apos;t generate match IDs or referee your games —
            eFootball Mobile does. We&apos;re the layer on top that handles
            matchmaking, staking, disputes, and rankings, so you can focus on
            playing. We&apos;re a small, independent team, and we&apos;re
            still building — if something feels off or you have an idea to
            make TournyPlay better, we want to hear it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink">
            Get in touch
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-dim">
            Have a question, feedback, or a partnership idea? Visit our{" "}
            <a href="/contact" className="font-semibold text-pitch hover:underline">
              Contact Us
            </a>{" "}
            page and drop us a message.
          </p>
        </section>
      </div>
    </div>
  );
}
