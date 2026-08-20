import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/get-user-id";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import type { PlayerStats } from "@/types/database";

// Leaderboard data doesn't need to be instant-fresh on every request —
// revalidate it periodically instead of hitting the database on every
// single page view.
export const revalidate = 30;

export default async function LeaderboardPage() {
  const supabase = createClient();

  // Resolved once by middleware already; no extra getUser() round trip.
  const userId = getUserId();

  const { data: leaderboard } = await supabase.rpc("get_leaderboard", {
    p_limit: 50,
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
      <p className="mt-1 text-ink-dim">
        Ranked by wins across approved matches. Tap a player to see their
        win rate, tokens won, and full match history.
      </p>

      <div className="mt-6">
        <LeaderboardTable
          players={(leaderboard as PlayerStats[]) ?? []}
          currentUserId={userId ?? undefined}
        />
      </div>
    </div>
  );
}
