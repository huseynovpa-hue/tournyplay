"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileName, setProfileName] = useState("");
  const [efootballUsername, setEfootballUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!profileName.trim() || !efootballUsername.trim()) {
      setError("Please fill in both username fields.");
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          profile_name: profileName.trim(),
          efootball_username: efootballUsername.trim(),
        },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      // Email confirmation is required by the Supabase project settings.
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-2xl border border-base-border bg-base-surface p-8 text-center">
        <h1 className="font-display text-2xl font-bold text-pitch">
          Check your inbox
        </h1>
        <p className="mt-3 text-ink-dim">
          We sent a confirmation link to <strong className="text-ink">{email}</strong>.
          Confirm your email, then log in to start creating rooms.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-pitch px-5 py-2 font-semibold text-base"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h1 className="font-display text-3xl font-bold">Create your account</h1>
      <p className="mt-1 text-ink-dim">
        Join TournyPlay and start competing in eFootball Mobile 1v1 rooms.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-base-border bg-base-raised px-3.5 py-2.5 text-ink outline-none focus:border-pitch"
            placeholder="At least 6 characters"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Profile name
          </label>
          <input
            type="text"
            required
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="w-full rounded-lg border border-base-border bg-base-raised px-3.5 py-2.5 text-ink outline-none focus:border-pitch"
            placeholder="Anything you like — this is your public display name"
          />
          <p className="mt-1 text-xs text-ink-faint">
            Shown on the site. Can be different from your eFootball username.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            eFootball Mobile username
          </label>
          <input
            type="text"
            required
            value={efootballUsername}
            onChange={(e) => setEfootballUsername(e.target.value)}
            className="w-full rounded-lg border border-base-border bg-base-raised px-3.5 py-2.5 text-ink outline-none focus:border-pitch"
            placeholder="Exact username from the eFootball Mobile app"
          />
          <p className="mt-1 text-xs font-medium text-warn">
            This must be the same as your eFootball username.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-pitch py-2.5 font-display text-base font-bold text-base disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-dim">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-volt">
          Log in
        </Link>
      </p>
    </div>
  );
}
