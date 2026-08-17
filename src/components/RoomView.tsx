"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Room, RoomResult } from "@/types/database";
import { StatusBadge } from "./StatusBadge";
import { CountdownTimer } from "./CountdownTimer";
import { RoomChat } from "./RoomChat";
import { MatchFlow } from "./MatchFlow";
import { ResultPanel } from "./ResultPanel";
import { RulesContent } from "./RulesContent";

export function RoomView({
  initialRoom,
  initialResult,
  currentUserId,
}: {
  initialRoom: Room;
  initialResult: RoomResult | null;
  currentUserId: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [room, setRoom] = useState(initialRoom);
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const refresh = useCallback(async () => {
    const { data: roomData } = await supabase
      .from("rooms")
      .select(
        "*, creator:profiles!rooms_creator_id_fkey(*), opponent:profiles!rooms_opponent_id_fkey(*)"
      )
      .eq("id", room.id)
      .single<Room>();
    if (roomData) setRoom(roomData);

    const { data: resultData } = await supabase
      .from("room_results")
      .select("*")
      .eq("room_id", room.id)
      .maybeSingle<RoomResult>();
    setResult(resultData ?? null);
  }, [room.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${room.id}` },
        () => refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_results",
          filter: `room_id=eq.${room.id}`,
        },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id, refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleJoin() {
    setJoining(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("join_room", {
      p_room_id: room.id,
    });
    setJoining(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    refresh();
  }

  async function handleCancel() {
    setError(null);
    const { error: rpcError } = await supabase.rpc("cancel_room", {
      p_room_id: room.id,
    });
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    router.push("/my-rooms");
  }

  const isCreator = room.creator_id === currentUserId;
  const isOpponent = room.opponent_id === currentUserId;
  const isParticipant = isCreator || isOpponent;

  const senderNames: Record<string, string> = {};
  if (room.creator) senderNames[room.creator_id] = room.creator.profile_name;
  if (room.opponent && room.opponent_id)
    senderNames[room.opponent_id] = room.opponent.profile_name;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-base-border bg-base-surface p-6">
        <div className="flex items-center justify-between">
          <StatusBadge status={room.status} />
          <span className="font-display text-2xl font-bold text-pitch">
            {room.stake.toLocaleString()} tokens
          </span>
        </div>

        {room.status === "full" && room.expires_at && (
          <div className="mt-3">
            <CountdownTimer expiresAt={room.expires_at} />
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-base-border bg-base-raised p-4">
            <p className="text-xs uppercase tracking-wide text-ink-faint">
              Host
            </p>
            <p className="mt-1 font-display text-lg font-bold text-ink">
              {room.creator?.profile_name ?? "—"}
            </p>
            <p className="text-xs text-ink-dim">
              eFootball: {room.creator?.efootball_username ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-base-border bg-base-raised p-4">
            <p className="text-xs uppercase tracking-wide text-ink-faint">
              Opponent
            </p>
            <p className="mt-1 font-display text-lg font-bold text-ink">
              {room.opponent?.profile_name ?? "Waiting to join…"}
            </p>
            {room.opponent && (
              <p className="text-xs text-ink-dim">
                eFootball: {room.opponent?.efootball_username}
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        {room.finished_at && (
          <p className="mt-4 text-xs text-ink-faint">
            Played on{" "}
            {new Date(room.finished_at).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            at{" "}
            {new Date(room.finished_at).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          {room.status === "open" && !isCreator && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="btn-3d btn-3d-pitch rounded-lg px-5 py-2.5 font-display font-bold disabled:opacity-60"
            >
              {joining ? "Joining..." : `Join for ${room.stake} tokens`}
            </button>
          )}
          {room.status === "open" && isCreator && (
            <button
              onClick={handleCancel}
              className="btn-3d btn-3d-danger rounded-lg px-5 py-2.5 font-semibold"
            >
              Cancel room & refund my tokens
            </button>
          )}
          <button
            onClick={() => setShowRules((s) => !s)}
            className="btn-3d btn-3d-outline rounded-lg px-5 py-2.5 font-semibold"
          >
            {showRules ? "Hide rules" : "View match rules"}
          </button>
        </div>
      </div>

      {showRules && (
        <div className="mt-6 rounded-2xl border border-base-border bg-base-surface p-6">
          <RulesContent />
        </div>
      )}

      {isParticipant && room.status === "full" && (
        <div className="mt-6">
          <MatchFlow room={room} currentUserId={currentUserId} onChanged={refresh} />
        </div>
      )}

      {isParticipant && room.status !== "open" && (
        <div className="mt-6">
          <RoomChat
            roomId={room.id}
            currentUserId={currentUserId}
            senderNames={senderNames}
          />
        </div>
      )}

      {isParticipant &&
        (room.status === "full" ||
          room.status === "reported" ||
          room.status === "completed" ||
          room.status === "disputed") && (
          <div className="mt-6">
            <ResultPanel
              room={room}
              result={result}
              currentUserId={currentUserId}
              onChanged={refresh}
            />
          </div>
        )}

      {room.status === "expired" && (
        <div className="mt-6 rounded-xl border border-ink-faint/30 bg-base-surface p-5 text-sm text-ink-dim">
          This room expired after 1 hour with no approved result. Both
          players&apos; tokens have been refunded.
        </div>
      )}
    </div>
  );
}
