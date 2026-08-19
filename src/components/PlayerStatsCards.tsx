import type { PlayerStats } from "@/types/database";

export function PlayerStatsCards({ stats }: { stats: PlayerStats }) {
  const cards = [
    { label: "Matches played", value: stats.matches_played.toLocaleString() },
    { label: "Win rate", value: `${stats.win_rate ?? 0}%` },
    { label: "Wins / Losses", value: `${stats.wins} / ${stats.losses}` },
    { label: "Total tokens won", value: stats.tokens_won.toLocaleString() },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-base-border bg-base-surface p-4 text-center"
        >
          <p className="font-display text-2xl font-bold text-pitch">
            {c.value}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wide text-ink-faint">
            {c.label}
          </p>
        </div>
      ))}
    </div>
  );
}
