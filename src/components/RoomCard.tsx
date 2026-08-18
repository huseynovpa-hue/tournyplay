import Link from "next/link";
import type { Room, RoomStatus } from "@/types/database";
import { StatusBadge } from "./StatusBadge";

// A handful of hand-picked, on-brand hues (kept vivid but not neon) so
// different players get visually distinct avatars, deterministically
// derived from their name — no extra data needed, no re-render flicker.
const AVATAR_PALETTES = [
  { bg: "from-pitch to-emerald-700", ring: "ring-pitch/40" },
  { bg: "from-volt to-blue-700", ring: "ring-volt/40" },
  { bg: "from-warn to-orange-700", ring: "ring-warn/40" },
  { bg: "from-fuchsia-400 to-fuchsia-700", ring: "ring-fuchsia-400/40" },
  { bg: "from-cyan-400 to-cyan-700", ring: "ring-cyan-400/40" },
  { bg: "from-rose-400 to-rose-700", ring: "ring-rose-400/40" },
];

function paletteFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function Avatar({ name, open }: { name: string; open: boolean }) {
  if (open) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-base-border text-ink-faint">
        <span className="text-xs">?</span>
      </div>
    );
  }
  const palette = paletteFor(name);
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-display text-sm font-bold text-base ring-2 ${palette.bg} ${palette.ring}`}
    >
      {initial}
    </div>
  );
}

const ACCENT: Record<RoomStatus, string> = {
  open: "from-volt via-cyan-400 to-pitch",
  full: "from-warn via-amber-400 to-warn",
  reported: "from-warn via-amber-400 to-warn",
  completed: "from-pitch via-emerald-400 to-pitch",
  disputed: "from-danger via-rose-500 to-danger",
  expired: "from-ink-faint to-ink-faint",
  cancelled: "from-ink-faint to-ink-faint",
};

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
      className="card-3d group relative block overflow-hidden rounded-xl border border-base-border bg-base-surface p-4 pt-5 transition hover:border-pitch/50 hover:bg-base-raised hover:shadow-[0_0_0_1px_rgba(57,217,124,0.15),0_18px_32px_-14px_rgba(57,217,124,0.25)]"
    >
      {/* Colorful status accent strip */}
      <span
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${ACCENT[room.status]}`}
      />

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
        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-pitch/20 to-emerald-500/10 px-3 py-1 font-display text-lg font-bold text-pitch ring-1 ring-inset ring-pitch/30">
          {room.stake.toLocaleString()} tokens
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar
            name={room.creator?.profile_name ?? "?"}
            open={false}
          />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-ink-faint">
              Host
            </p>
            <NameTag
              name={room.creator?.profile_name ?? "Unknown"}
              isYou={!!currentUserId && room.creator_id === currentUserId}
            />
          </div>
        </div>

        <span className="shrink-0 font-display text-xs font-bold text-ink-faint">
          VS
        </span>

        <div className="flex min-w-0 flex-row-reverse items-center gap-2.5 text-right">
          <Avatar
            name={room.opponent?.profile_name ?? "?"}
            open={!room.opponent}
          />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-ink-faint">
              Opponent
            </p>
            <NameTag
              name={room.opponent?.profile_name ?? "— open —"}
              isYou={!!currentUserId && room.opponent_id === currentUserId}
            />
          </div>
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
