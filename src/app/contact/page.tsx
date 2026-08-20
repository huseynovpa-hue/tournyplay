"use client";

import { useState } from "react";

const SUPPORT_EMAIL = "khannhuseyn@gmail.com";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message,
    ].join("\n");

    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject || "TournyPlay support request"
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-bold">Contact Us</h1>
      <p className="mt-1 text-ink-dim">
        Questions, bug reports, disputes, or feedback — we&apos;d like to
        hear it.
      </p>

      <div className="mt-6 rounded-xl border border-base-border bg-base-surface px-4 py-3 text-sm text-ink-dim">
        Prefer email? Reach us directly at{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="font-semibold text-pitch hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
        .
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-base-border bg-base-raised px-3.5 py-2.5 text-ink outline-none focus:border-pitch"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-base-border bg-base-raised px-3.5 py-2.5 text-ink outline-none focus:border-pitch"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Dispute on room #1234"
            className="w-full rounded-lg border border-base-border bg-base-raised px-3.5 py-2.5 text-ink outline-none placeholder:text-ink-faint focus:border-pitch"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Message
          </label>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-none rounded-lg border border-base-border bg-base-raised px-3.5 py-2.5 text-ink outline-none focus:border-pitch"
          />
        </div>

        {sent && (
          <p className="rounded-lg border border-pitch/40 bg-pitch/10 px-3.5 py-2.5 text-sm text-pitch">
            Your email app should now be open with this message ready to
            send. If nothing opened, email us directly at {SUPPORT_EMAIL}.
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-pitch py-2.5 font-display text-base font-bold text-base"
        >
          Send message
        </button>
      </form>
    </div>
  );
}
