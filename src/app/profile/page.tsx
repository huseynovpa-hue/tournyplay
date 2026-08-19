"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const TOKENS_PER_DOLLAR = Number(
  process.env.NEXT_PUBLIC_TOKENS_PER_DOLLAR ?? 100
);
const TOKEN_PACKS = [500, 1000, 2500, 5000];

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [profileName, setProfileName] = useState("");
  const [efootballUsername, setEfootballUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?next=/profile");
        return;
      }
      setEmail(user.email ?? "");
      setUserId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select("profile_name, efootball_username, token_balance")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfileName(data.profile_name);
        setEfootballUsername(data.efootball_username);
        setBalance(data.token_balance);
      }
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        profile_name: profileName.trim(),
        efootball_username: efootballUsername.trim(),
      })
      .eq("id", user.id);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setMessage("Profile updated.");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="skeleton h-8 w-32 rounded-lg" />
        <div className="skeleton mt-2 h-4 w-64 rounded-lg" />
        <div className="mt-6 rounded-2xl border border-base-border bg-base-surface p-6">
          <div className="skeleton h-16 w-full rounded-xl" />
          <div className="mt-6 space-y-5">
            <div className="skeleton h-10 w-full rounded-lg" />
            <div className="skeleton h-10 w-full rounded-lg" />
            <div className="skeleton h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-3xl font-bold">Account</h1>
      <p className="mt-1 text-ink-dim">
        Manage your profile, eFootball username, and token balance.
      </p>

      <div className="mt-6 rounded-2xl border border-base-border bg-base-surface p-6">
        <div className="flex items-center justify-between rounded-xl bg-base-raised px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-faint">
              Token balance
            </p>
            <p className="font-display text-3xl font-bold text-pitch">
              {balance.toLocaleString()}
            </p>
          </div>
          <a
            href="#buy-tokens"
            className="btn-3d btn-3d-pitch rounded-lg px-4 py-2 font-semibold"
          >
            Buy tokens
          </a>
        </div>

        {userId && (
          <Link
            href={`/players/${userId}`}
            className="mt-4 flex items-center justify-between rounded-xl border border-base-border bg-base-raised px-5 py-3 text-sm font-semibold text-ink hover:border-pitch/50 hover:text-pitch"
          >
            View my stats & match history
            <span aria-hidden>→</span>
          </Link>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Email
            </label>
            <input
              disabled
              value={email}
              className="w-full cursor-not-allowed rounded-lg border border-base-border bg-base px-3.5 py-2.5 text-ink-faint"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Profile name
            </label>
            <input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full rounded-lg border border-base-border bg-base-raised px-3.5 py-2.5 text-ink outline-none focus:border-pitch"
            />
            <p className="mt-1 text-xs text-ink-faint">
              Your public display name — can be anything.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              eFootball Mobile username
            </label>
            <input
              value={efootballUsername}
              onChange={(e) => setEfootballUsername(e.target.value)}
              className="w-full rounded-lg border border-base-border bg-base-raised px-3.5 py-2.5 text-ink outline-none focus:border-pitch"
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
          {message && (
            <p className="rounded-lg border border-pitch/40 bg-pitch/10 px-3.5 py-2.5 text-sm text-pitch">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-3d btn-3d-pitch w-full rounded-lg py-2.5 font-display font-bold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>

      <div
        id="buy-tokens"
        className="mt-8 scroll-mt-20 rounded-2xl border border-base-border bg-base-surface p-6"
      >
        <h2 className="font-display text-xl font-bold text-ink">
          Buy tokens
        </h2>
        <p className="mt-1 text-sm text-ink-dim">
          {TOKENS_PER_DOLLAR} tokens = $1. Tokens are used only to create and
          join rooms — never real-money betting.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {TOKEN_PACKS.map((amount) => (
            <div
              key={amount}
              className="rounded-xl border border-base-border bg-base-raised p-4 text-center"
            >
              <p className="font-display text-2xl font-bold text-ink">
                {amount.toLocaleString()}
              </p>
              <p className="text-xs text-ink-faint">tokens</p>
              <p className="mt-2 font-semibold text-pitch">
                ${(amount / TOKENS_PER_DOLLAR).toFixed(2)}
              </p>
              <button
                disabled
                title="Payments are not connected yet"
                className="mt-3 w-full cursor-not-allowed rounded-lg border border-base-border py-1.5 text-sm font-semibold text-ink-faint"
              >
                Coming soon
              </button>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-faint">
          Payment processing isn&apos;t connected yet. See the project README
          for how to wire this up with Stripe.
        </p>
      </div>
    </div>
  );
}
