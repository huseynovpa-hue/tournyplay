import Link from "next/link";
import type { PlayerMatchHistoryItem } from "@/types/database";

export function MatchHistoryList({
  matches,
}: {
  matches: PlayerMatchHistoryItem[];
}) {
  if (matches.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-base-border p-6 text-center text-sm text-ink-dim">
        No completed matches yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((m) => (
        <Link
          key={m.room_id}
          href={`/rooms/${m.room_id}`}
          className="flex items-center justify-between gap-3 rounded-xl border border-base-border bg-base-surface p-4 transition hover:border-pitch/50 hover:bg-base-raised"
        >
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">
              vs {m.opponent_name ?? "Unknown"}
            </p>
            <p className="mt-0.5 text-xs text-ink-faint">
              {m.finished_at
                ? new Date(m.finished_at).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}{" "}
              · {m.stake.toLocaleString()} token stake
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="font-display text-lg font-bold text-ink">
              {m.score_for}–{m.score_against}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                m.won ? "bg-pitch/15 text-pitch" : "bg-danger/15 text-danger"
              }`}
            >
              {m.won ? "Won" : "Lost"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
