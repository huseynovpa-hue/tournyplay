"use client";

import { useState } from "react";
import type { Profile, Room, RoomResult } from "@/types/database";

export function DisputeCard({
  room,
  result,
  creator,
  opponent,
  reporter,
  reportedWinner,
}: {
  room: Room;
  result: RoomResult | undefined;
  creator: Profile | undefined;
  opponent: Profile | undefined;
  reporter: Profile | undefined;
  reportedWinner: Profile | undefined;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  async function resolve(winnerId: string, winnerLabel: string) {
    const confirmed = window.confirm(
      `Award the ${room.stake * 2}-token pot to ${winnerLabel}? This cannot be undone.`
    );
    if (!confirmed) return;

    setBusy(winnerId);
    setError(null);

    try {
      const res = await fetch("/api/admin/resolve-dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: room.id, winnerId }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Something went wrong.");
        setBusy(null);
        return;
      }

      setResolved(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(null);
    }
  }

  if (resolved) {
    return (
      <div className="rounded-xl border border-pitch/40 bg-pitch/10 px-4 py-4 text-sm text-pitch">
        Resolved — the pot was credited and both players were notified.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-base-border bg-base-surface p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-bold text-ink">
          {room.stake}-token room
        </p>
        <a
          href={`/rooms/${room.id}`}
          className="text-xs font-semibold text-volt hover:underline"
        >
          Open room →
        </a>
      </div>
      <p className="mt-1 text-xs text-ink-faint">Room ID: {room.id}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-base-border bg-base-raised px-3 py-2.5">
          <p className="text-xs uppercase tracking-wide text-ink-faint">
            Creator
          </p>
          <p className="font-semibold text-ink">
            {creator?.profile_name ?? "Unknown"}
          </p>
          <p className="text-xs text-ink-dim">
            {creator?.efootball_username}
          </p>
        </div>
        <div className="rounded-lg border border-base-border bg-base-raised px-3 py-2.5">
          <p className="text-xs uppercase tracking-wide text-ink-faint">
            Opponent
          </p>
          <p className="font-semibold text-ink">
            {opponent?.profile_name ?? "Unknown"}
          </p>
          <p className="text-xs text-ink-dim">
            {opponent?.efootball_username}
          </p>
        </div>
      </div>

      {result ? (
        <div className="mt-4 rounded-lg border border-warn/40 bg-warn/10 px-3.5 py-3 text-sm">
          <p className="text-ink-dim">
            <span className="font-semibold text-ink">
              {reporter?.profile_name ?? "A player"}
            </span>{" "}
            reported{" "}
            <span className="font-semibold text-ink">
              {reportedWinner?.profile_name ?? "?"}
            </span>{" "}
            as the winner, {result.score_winner}–{result.score_loser}. The
            other player rejected this.
          </p>
          <a
            href={result.screenshot_url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block font-semibold text-volt hover:underline"
          >
            View reported screenshot →
          </a>
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink-dim">
          No result record found for this room.
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() =>
            resolve(room.creator_id, creator?.profile_name ?? "the creator")
          }
          disabled={busy !== null}
          className="btn-3d btn-3d-pitch rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {busy === room.creator_id
            ? "Awarding..."
            : `Award ${creator?.profile_name ?? "creator"}`}
        </button>
        {room.opponent_id && (
          <button
            onClick={() =>
              resolve(
                room.opponent_id as string,
                opponent?.profile_name ?? "the opponent"
              )
            }
            disabled={busy !== null}
            className="btn-3d btn-3d-pitch rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {busy === room.opponent_id
              ? "Awarding..."
              : `Award ${opponent?.profile_name ?? "opponent"}`}
          </button>
        )}
      </div>
    </div>
  );
}
