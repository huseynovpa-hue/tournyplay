"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Room } from "@/types/database";

export function MatchFlow({
  room,
  currentUserId,
  onChanged,
}: {
  room: Room;
  currentUserId: string;
  onChanged: () => void;
}) {
  const supabase = createClient();
  const isCreator = room.creator_id === currentUserId;

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSetCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("set_room_code", {
      p_room_id: room.id,
      p_code: code.trim(),
    });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    onChanged();
  }

  async function handleCopy() {
    if (!room.room_code) return;
    await navigator.clipboard.writeText(room.room_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleStart() {
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("start_match", {
      p_room_id: room.id,
    });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    onChanged();
  }

  async function handleFinish() {
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("finish_match", {
      p_room_id: room.id,
    });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    onChanged();
  }

  return (
    <div className="rounded-xl border border-base-border bg-base-surface p-5">
      <h3 className="font-display text-lg font-bold">Match room</h3>

      {/* Step 1: room code */}
      {!room.room_code ? (
        isCreator ? (
          <form onSubmit={handleSetCode} className="mt-3 space-y-2">
            <p className="text-sm text-ink-dim">
              Open eFootball Mobile, start a Friendly Match, and paste the
              Room ID it gives you below so your opponent can join in-game.
            </p>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 123456"
                className="flex-1 rounded-lg border border-base-border bg-base-raised px-3.5 py-2 text-ink outline-none focus:border-pitch"
              />
              <button
                type="submit"
                disabled={busy || !code.trim()}
                className="rounded-lg bg-pitch px-4 py-2 font-semibold text-base disabled:opacity-50"
              >
                Share ID
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-3 text-sm text-ink-dim">
            Waiting for the host to share the Friendly Match Room ID…
          </p>
        )
      ) : (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-base-raised px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-faint">
              Match room ID
            </p>
            <p className="font-display text-2xl font-bold tracking-widest text-pitch">
              {room.room_code}
            </p>
          </div>
          {!isCreator && (
            <button
              onClick={handleCopy}
              className="rounded-lg border border-base-border px-3 py-1.5 text-sm font-semibold text-ink-dim hover:text-ink"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      )}

      {/* Step 2: start / finish */}
      {room.room_code && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {!room.started_at ? (
            <button
              onClick={handleStart}
              disabled={busy}
              className="rounded-lg bg-volt px-4 py-2.5 font-semibold text-base disabled:opacity-60"
            >
              Start match
            </button>
          ) : !room.finished_at ? (
            <>
              <span className="text-sm font-semibold text-warn">
                Match in progress — good luck!
              </span>
              <button
                onClick={handleFinish}
                disabled={busy}
                className="rounded-lg bg-pitch px-4 py-2.5 font-semibold text-base disabled:opacity-60"
              >
                Finish match
              </button>
            </>
          ) : (
            <span className="text-sm font-semibold text-pitch">
              Match finished — report the result below.
            </span>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
