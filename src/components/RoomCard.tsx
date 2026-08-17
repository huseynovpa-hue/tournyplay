import Link from "next/link";
import type { Room } from "@/types/database";
import { StatusBadge } from "./StatusBadge";

function NameTag({
  name,
  isYou,
}: {
  name: string;
  isYou: boolean;
}) {
  return (
    <p
      className={
        isYou
          ? "font-display font-bold text-pitch"
          : "font-semibold text-ink"
      }
    >
      {name}
      {isYou && <span className="ml-1 text-xs font-medium text-ink-faint">(You)</span>}
    </p>
  );
}

function formatMatchDate(room: Room) {
  const raw = room.finished_at ?? room.started_at ?? room.created_at;
  if (!raw) return null;
  const date = new Date(raw);
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) + " · " + date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RoomCard({
  room,
  currentUserId,
  showDate = false,
}: {
  room: Room;
  currentUserId?: string;
  showDate?: boolean;
}) {
  const isMine =
    currentUserId &&
    (room.creator_id === currentUserId || room.opponent_id === currentUserId);

  let outcomeOverride: { label: string; className: string } | null = null;
  if (room.status === "completed" && room.result && currentUserId && isMine) {
    const won = room.result.winner_id === currentUserId;
    outcomeOverride = won
      ? { label: "Won", className: "bg-pitch/15 text-pitch border-pitch/30" }
      : { label: "Lost", className: "bg-danger/15 text-danger border-danger/30" };
  }

  const matchDate = showDate ? formatMatchDate(room) : null;

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="card-3d block rounded-xl border border-base-border bg-base-surface p-4 transition hover:border-pitch/50 hover:bg-base-raised"
    >
      <div className="flex items-center justify-between">
        {outcomeOverride ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${outcomeOverride.className}`}
          >
            {outcomeOverride.label}
          </span>
        ) : (
          <StatusBadge status={room.status} />
        )}
        <span className="font-display text-lg font-bold text-pitch">
          {room.stake.toLocaleString()} tokens
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-faint">
            Host
          </p>
          <NameTag
            name={room.creator?.profile_name ?? "Unknown"}
            isYou={!!currentUserId && room.creator_id === currentUserId}
          />
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-ink-faint">
            Opponent
          </p>
          <NameTag
            name={room.opponent?.profile_name ?? "— open —"}
            isYou={!!currentUserId && room.opponent_id === currentUserId}
          />
        </div>
      </div>

      {matchDate && (
        <p className="mt-3 border-t border-base-border pt-2.5 text-xs text-ink-faint">
          Played {matchDate}
        </p>
      )}

      {isMine && !outcomeOverride && !matchDate && (
        <p className="mt-3 text-xs font-semibold text-volt">
          You&apos;re in this room
        </p>
      )}
    </Link>
  );
}
