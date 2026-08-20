import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — TournyPlay",
  description:
    "How TournyPlay collects, uses, and protects your information.",
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Introduction",
    body: (
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        This Privacy Policy explains how TournyPlay (&quot;we&quot;,
        &quot;us&quot;, &quot;our&quot;) collects, uses, and protects your
        information when you use our website and services (the
        &quot;Service&quot;). By using TournyPlay, you agree to the
        collection and use of information as described in this policy.
      </p>
    ),
  },
  {
    title: "2. Information we collect",
    body: (
      <ul className="mt-3 space-y-2.5 text-sm text-ink-dim">
        <li>
          <span className="font-semibold text-ink">Account information.</span>{" "}
          Your email address, profile name, and eFootball Mobile username
          when you sign up.
        </li>
        <li>
          <span className="font-semibold text-ink">Match activity.</span>{" "}
          Rooms you create or join, token balances, stakes, reported results,
          and result screenshots you upload for dispute resolution.
        </li>
        <li>
          <span className="font-semibold text-ink">
            Device and usage data.
          </span>{" "}
          Basic technical data such as browser type and push-notification
          subscription details, used only to operate the Service.
        </li>
        <li>
          <span className="font-semibold text-ink">
            Messages you send us.
          </span>{" "}
          Anything you submit through the Contact Us form or by emailing us
          directly.
        </li>
      </ul>
    ),
  },
  {
    title: "3. How we use your information",
    body: (
      <ul className="mt-3 space-y-2.5 text-sm text-ink-dim">
        <li>To create and manage your account.</li>
        <li>To operate rooms, matchmaking, staking, and the leaderboard.</li>
        <li>
          To send notifications about your rooms and matches (for example,
          when a room fills up or a result is submitted).
        </li>
        <li>To investigate disputed results and enforce our match rules.</li>
        <li>To respond to support requests sent through Contact Us.</li>
        <li>To keep the Service secure and prevent abuse or fraud.</li>
      </ul>
    ),
  },
  {
    title: "4. Sharing your information",
    body: (
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        We do not sell your personal information. Your profile name and
        match statistics are visible to other users as part of the normal
        operation of rooms and the leaderboard. We may share information
        with service providers who help us run the Service (such as our
        hosting and database provider), and where required by law.
      </p>
    ),
  },
  {
    title: "5. Data retention",
    body: (
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        We retain account and match data for as long as your account is
        active, and as needed to resolve disputes, maintain accurate
        leaderboard history, and comply with legal obligations. You can
        request deletion of your account as described below.
      </p>
    ),
  },
  {
    title: "6. Your choices",
    body: (
      <ul className="mt-3 space-y-2.5 text-sm text-ink-dim">
        <li>You can update your profile information at any time.</li>
        <li>You can disable push notifications from your device settings.</li>
        <li>
          You can request access to, correction of, or deletion of your
          personal data by contacting us — see the Contact Us page.
        </li>
      </ul>
    ),
  },
  {
    title: "7. Security",
    body: (
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        We use reasonable technical and organizational measures to protect
        your information. No method of transmission or storage is 100%
        secure, so we cannot guarantee absolute security.
      </p>
    ),
  },
  {
    title: "8. Changes to this policy",
    body: (
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        We may update this Privacy Policy from time to time. If we make
        material changes, we will update the date below and, where
        appropriate, notify you through the Service.
      </p>
    ),
  },
  {
    title: "9. Contact us",
    body: (
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        If you have questions about this Privacy Policy or your data, please
        visit our{" "}
        <a href="/contact" className="font-semibold text-pitch hover:underline">
          Contact Us
        </a>{" "}
        page.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-1 text-ink-dim">Last updated: {"January 1, 2026"}</p>

      <div className="mt-8 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-bold text-ink">
              {section.title}
            </h2>
            {section.body}
          </section>
        ))}
      </div>
    </div>
  );
}
