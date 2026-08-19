"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Room, RoomResult } from "@/types/database";

export function ResultPanel({
  room,
  result,
  currentUserId,
  onChanged,
}: {
  room: Room;
  result: RoomResult | null;
  currentUserId: string;
  onChanged: () => void;
}) {
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [winnerId, setWinnerId] = useState(currentUserId);
  const [scoreWinner, setScoreWinner] = useState("");
  const [scoreLoser, setScoreLoser] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const opponentId =
    room.creator_id === currentUserId ? room.opponent_id : room.creator_id;

  const nameFor = (id: string | null) => {
    if (!id) return "—";
    if (id === room.creator_id) return room.creator?.profile_name ?? "Host";
    return room.opponent?.profile_name ?? "Opponent";
  };

  async function handleSubmitResult(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please attach the Match History screenshot.");
      return;
    }
    const sw = Number(scoreWinner);
    const sl = Number(scoreLoser);
    if (Number.isNaN(sw) || Number.isNaN(sl) || sw <= sl) {
      setError("Enter a valid score — the winner's score must be higher.");
      return;
    }

    setBusy(true);

    const path = `${room.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("result-screenshots")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setBusy(false);
      setError(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("result-screenshots").getPublicUrl(path);

    const { error: rpcError } = await supabase.rpc("submit_result", {
      p_room_id: room.id,
      p_winner_id: winnerId,
      p_score_winner: sw,
      p_score_loser: sl,
      p_screenshot_url: publicUrl,
    });

    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    // Best-effort: let the other player know a result is waiting on them.
    fetch("/api/notify/result-submitted", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: room.id }),
    }).catch(() => {});

    setShowForm(false);
    onChanged();
  }

  async function handleApprove() {
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("approve_result", {
      p_room_id: room.id,
    });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    onChanged();
  }

  async function handleReject() {
    const confirmed = window.confirm(
      "Reject this result? The match will be marked as disputed and reviewed manually. Neither player will receive tokens until it's resolved."
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("reject_result", {
      p_room_id: room.id,
    });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    onChanged();
  }

  if (room.status === "full") {
    if (!room.finished_at) {
      return (
        <div className="rounded-xl border border-base-border bg-base-surface p-5">
          <h3 className="font-display text-lg font-bold">Report the result</h3>
          <p className="mt-2 text-sm text-ink-dim">
            Set the match room ID, start the match, and click{" "}
            <span className="font-semibold text-ink">Finish match</span>{" "}
            above once you&apos;re done playing — the result form will
            appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-base-border bg-base-surface p-5">
        <h3 className="font-display text-lg font-bold">Report the result</h3>
        <p className="mt-1 text-sm text-ink-dim">
          The winner reports the score with a screenshot from Match History.
        </p>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="btn-3d btn-3d-pitch mt-4 rounded-lg px-4 py-2.5 font-semibold"
          >
            Report result
          </button>
        ) : (
          <form onSubmit={handleSubmitResult} className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Who won?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWinnerId(currentUserId)}
                  className={`btn-3d rounded-lg px-3 py-2 text-sm font-semibold ${
                    winnerId === currentUserId
                      ? "btn-3d-pitch"
                      : "btn-3d-outline"
                  }`}
                >
                  Me
                </button>
                <button
                  type="button"
                  onClick={() => opponentId && setWinnerId(opponentId)}
                  className={`btn-3d rounded-lg px-3 py-2 text-sm font-semibold ${
                    winnerId === opponentId
                      ? "btn-3d-pitch"
                      : "btn-3d-outline"
                  }`}
                >
                  {nameFor(opponentId)}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Winner&apos;s score
                </label>
                <input
                  type="number"
                  min={0}
                  value={scoreWinner}
                  onChange={(e) => setScoreWinner(e.target.value)}
                  className="w-full rounded-lg border border-base-border bg-base-raised px-3.5 py-2 text-ink outline-none focus:border-pitch"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Loser&apos;s score
                </label>
                <input
                  type="number"
                  min={0}
                  value={scoreLoser}
                  onChange={(e) => setScoreLoser(e.target.value)}
                  className="w-full rounded-lg border border-base-border bg-base-raised px-3.5 py-2 text-ink outline-none focus:border-pitch"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Match History screenshot
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-ink-dim file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-base-raised file:px-3 file:py-2 file:font-semibold file:text-ink file:transition hover:file:brightness-110"
              />
              <p className="mt-1 text-xs text-ink-faint">
                eFootball Mobile → Extras → User Information → Match History
              </p>
            </div>

            {error && (
              <p className="rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="btn-3d btn-3d-pitch rounded-lg px-4 py-2.5 font-semibold disabled:opacity-60"
              >
                {busy ? "Submitting..." : "Submit result"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-3d btn-3d-outline rounded-lg px-4 py-2.5 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  if (
    (room.status === "reported" ||
      room.status === "completed" ||
      room.status === "disputed") &&
    result
  ) {
    const canRespond =
      room.status === "reported" && result.reporter_id !== currentUserId;

    return (
      <div className="rounded-xl border border-base-border bg-base-surface p-5">
        <h3 className="font-display text-lg font-bold">Match result</h3>
        <div className="mt-3 flex items-center justify-center gap-4 rounded-lg bg-base-raised py-4">
          <div className="text-center">
            <p className="text-xs text-ink-faint">{nameFor(result.winner_id)}</p>
            <p className="font-display text-3xl font-bold text-pitch">
              {result.score_winner}
            </p>
          </div>
          <span className="text-ink-faint">—</span>
          <div className="text-center">
            <p className="text-xs text-ink-faint">
              {nameFor(
                result.winner_id === room.creator_id
                  ? room.opponent_id
                  : room.creator_id
              )}
            </p>
            <p className="font-display text-3xl font-bold text-ink-dim">
              {result.score_loser}
            </p>
          </div>
        </div>

        
          <a href={result.screenshot_url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block overflow-hidden rounded-lg border border-base-border"
        >
          <Image
            src={result.screenshot_url}
            alt="Match result screenshot"
            width={640}
            height={360}
            className="h-auto w-full object-cover"
            unoptimized
          />
        </a>

        {error && (
          <p className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        {room.status === "completed" ? (
          <p className="mt-4 rounded-lg bg-pitch/10 px-3.5 py-2.5 text-sm font-semibold text-pitch">
            ✓ Approved — {room.stake * 2} tokens credited to{" "}
            {nameFor(result.winner_id)}.
          </p>
        ) : room.status === "disputed" ? (
          <p className="mt-4 rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm font-semibold text-danger">
            This result was rejected and is pending manual review. Our team
            will check it and decide the outcome — tokens stay held until
            then.
          </p>
        ) : canRespond ? (
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleApprove}
              disabled={busy}
              className="btn-3d btn-3d-pitch flex-1 rounded-lg py-2.5 font-semibold disabled:opacity-60"
            >
              {busy ? "Working..." : "Approve result"}
            </button>
            <button
              onClick={handleReject}
              disabled={busy}
              className="btn-3d btn-3d-danger flex-1 rounded-lg py-2.5 font-semibold disabled:opacity-60"
            >
              Reject result
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-faint">
            Waiting for the other player to approve or reject this result.
          </p>
        )}
      </div>
    );
  }

  return null;
}
