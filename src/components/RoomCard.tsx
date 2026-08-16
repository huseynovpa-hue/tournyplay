import Link from "next/link";
import type { Room } from "@/types/database";
import { StatusBadge } from "./StatusBadge";

export function RoomCard({
  room,
  currentUserId,
}: {
  room: Room;
  currentUserId?: string;
}) {
  const isMine =
    currentUserId &&
    (room.creator_id === currentUserId || room.opponent_id === currentUserId);

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="block rounded-xl border border-base-border bg-base-surface p-4 transition hover:border-pitch/50 hover:bg-base-raised"
    >
      <div className="flex items-center justify-between">
        <StatusBadge status={room.status} />
        <span className="font-display text-lg font-bold text-pitch">
          {room.stake.toLocaleString()} tokens
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-faint">
            Host
          </p>
          <p className="font-semibold text-ink">
            {room.creator?.profile_name ?? "Unknown"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-ink-faint">
            Opponent
          </p>
          <p className="font-semibold text-ink">
            {room.opponent?.profile_name ?? "— open —"}
          </p>
        </div>
      </div>

      {isMine && (
        <p className="mt-3 text-xs font-semibold text-volt">
          You&apos;re in this room
        </p>
      )}
    </Link>
  );
}
