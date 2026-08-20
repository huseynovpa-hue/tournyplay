"use client";

import { useState } from "react";

const SUPPORT_EMAIL = "khannhuseyn@gmail.com";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  // Honeypot field, hidden from real users via CSS. Bots that fill in
  // every input will trip it; the API silently no-ops when it's set.
  const [company, setCompany] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, company }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
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

      {status === "success" ? (
        <div className="mt-6 rounded-xl border border-pitch/40 bg-pitch/10 px-4 py-4 text-sm text-pitch">
          Message sent — thanks for reaching out. We&apos;ll get back to you
          at the email you provided.
        </div>
      ) : (
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

          {/* Honeypot — kept off-screen and out of the tab order, never shown to real users. */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-lg bg-pitch py-2.5 font-display text-base font-bold text-base disabled:opacity-60"
          >
            {status === "loading" ? "Sending..." : "Send message"}
          </button>
        </form>
      )}
    </div>
  );
}
