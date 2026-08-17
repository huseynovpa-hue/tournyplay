"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PRESET_STAKES = [10, 20, 50, 100, 200];
const TOKENS_PER_DOLLAR = Number(
  process.env.NEXT_PUBLIC_TOKENS_PER_DOLLAR ?? 100
);

export default function CreateRoomPage() {
  const supabase = createClient();
  const router = useRouter();

  const [stake, setStake] = useState<number>(10);
  const [customStake, setCustomStake] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("token_balance")
        .eq("id", user.id)
        .single();
      setBalance(data?.token_balance ?? 0);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const finalStake = customStake ? Number(customStake) : stake;
  const dollarValue = (finalStake / TOKENS_PER_DOLLAR).toFixed(2);

  async function handleCreate() {
    setError(null);

    if (!agreed) {
      setError("You must confirm you've read the rules first.");
      return;
    }
    if (!finalStake || finalStake < 1) {
      setError("Enter a valid stake amount.");
      return;
    }
    if (balance !== null && finalStake > balance) {
      setError("You don't have enough tokens for this stake.");
      return;
    }

    setLoading(true);
    const { data, error: rpcError } = await supabase.rpc("create_room", {
      p_stake: finalStake,
    });
    setLoading(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    router.push(`/rooms/${data}`);
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-3xl font-bold">Create a room</h1>
      <p className="mt-1 text-ink-dim">
        Choose how many tokens both players will stake. The winner takes the
        full pot.
      </p>

      <div className="mt-6 rounded-xl border border-base-border bg-base-surface p-5">
        <p className="text-sm font-semibold text-ink">Stake amount</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {PRESET_STAKES.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setStake(amount);
                setCustomStake("");
              }}
              className={`btn-3d rounded-lg px-3 py-2.5 text-center font-display font-bold ${
                !customStake && stake === amount
                  ? "btn-3d-pitch"
                  : "btn-3d-outline"
              }`}
            >
              {amount}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <label className="mb-1.5 block text-xs font-semibold text-ink-faint">
            Or enter a custom amount
          </label>
          <input
            type="number"
            min={1}
            value={customStake}
            onChange={(e) => setCustomStake(e.target.value)}
            placeholder="e.g. 75"
            className="w-full rounded-lg border border-base-border bg-base-raised px-3.5 py-2.5 text-ink outline-none focus:border-pitch"
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-base-raised px-4 py-3 text-sm">
          <span className="text-ink-dim">Approx. value</span>
          <span className="font-semibold text-ink">
            {finalStake || 0} tokens (~${dollarValue})
          </span>
        </div>

        {balance !== null && (
          <p className="mt-2 text-xs text-ink-faint">
            Your balance: {balance.toLocaleString()} tokens
          </p>
        )}
      </div>

      <label className="mt-5 flex items-start gap-3 rounded-xl border border-warn/30 bg-warn/5 p-4 text-sm">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-pitch"
        />
        <span className="text-ink-dim">
          I&apos;ve read the{" "}
          <a href="/rules" target="_blank" className="font-semibold text-volt underline">
            match rules
          </a>{" "}
          — including match settings, the 1-hour time limit, and how results
          are reported and approved.
        </span>
      </label>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        onClick={handleCreate}
        disabled={loading}
        className="btn-3d btn-3d-pitch mt-6 w-full rounded-lg py-3 font-display text-base font-bold disabled:opacity-60"
      >
        {loading ? "Creating room..." : `Create room · ${finalStake || 0} tokens`}
      </button>
    </div>
  );
}
