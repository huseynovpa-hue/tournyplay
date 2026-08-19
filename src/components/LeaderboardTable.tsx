import Link from "next/link";
import type { PlayerStats } from "@/types/database";

export function LeaderboardTable({
  players,
  currentUserId,
}: {
  players: PlayerStats[];
  currentUserId?: string;
}) {
  if (players.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-base-border p-6 text-center text-sm text-ink-dim">
        No completed matches yet. Play a room and approve the result to show
        up here.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-base-border bg-base-surface">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-base-border bg-base-raised text-left text-xs uppercase tracking-wide text-ink-faint">
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Player</th>
            <th className="px-4 py-3 text-right">W</th>
            <th className="px-4 py-3 text-right">L</th>
            <th className="px-4 py-3 text-right">Win rate</th>
            <th className="px-4 py-3 text-right">Tokens won</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr
              key={p.user_id}
              className={`border-b border-base-border last:border-0 ${
                p.user_id === currentUserId ? "bg-pitch/5" : ""
              }`}
            >
              <td className="px-4 py-3 font-display font-bold text-ink-faint">
                {i + 1}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/players/${p.user_id}`}
                  className="font-semibold text-ink hover:text-pitch"
                >
                  {p.profile_name}
                  {p.user_id === currentUserId && (
                    <span className="ml-1.5 text-xs font-medium text-pitch">
                      (You)
                    </span>
                  )}
                </Link>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-pitch">
                {p.wins}
              </td>
              <td className="px-4 py-3 text-right text-ink-dim">
                {p.losses}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-ink">
                {p.win_rate ?? 0}%
              </td>
              <td className="px-4 py-3 text-right font-display font-bold text-pitch">
                {p.tokens_won.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
