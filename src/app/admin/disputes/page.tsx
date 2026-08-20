import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { DisputeCard } from "@/components/admin/DisputeCard";
import type { Profile, Room, RoomResult } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminDisputesPage() {
  const admin = await getAdminUser();

  if (!admin) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-2xl font-bold">Not authorized</h1>
        <p className="mt-2 text-sm text-ink-dim">
          This page is only available to the site admin account.
        </p>
      </div>
    );
  }

  const db = createAdminClient();

  const { data: rooms } = await db
    .from("rooms")
    .select("id, creator_id, opponent_id, stake, status, created_at")
    .eq("status", "disputed")
    .order("created_at", { ascending: true });

  const roomList = (rooms as Room[]) ?? [];

  let results: RoomResult[] = [];
  let profiles: Profile[] = [];

  if (roomList.length > 0) {
    const roomIds = roomList.map((r) => r.id);
    const userIds = Array.from(
      new Set(
        roomList.flatMap((r) => [r.creator_id, r.opponent_id]).filter(Boolean)
      )
    ) as string[];

    const [{ data: resultRows }, { data: profileRows }] = await Promise.all([
      db.from("room_results").select("*").in("room_id", roomIds),
      db.from("profiles").select("*").in("id", userIds),
    ]);

    results = (resultRows as RoomResult[]) ?? [];
    profiles = (profileRows as Profile[]) ?? [];
  }

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const resultByRoom = new Map(results.map((r) => [r.room_id, r]));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Disputed matches</h1>
      <p className="mt-1 text-ink-dim">
        Rooms where a reported result was rejected. Review the screenshot and
        pick the real winner to resolve each one.
      </p>

      <div className="mt-8 space-y-5">
        {roomList.length === 0 ? (
          <div className="rounded-xl border border-base-border bg-base-surface px-4 py-6 text-center text-sm text-ink-dim">
            No disputed matches right now.
          </div>
        ) : (
          roomList.map((room) => {
            const result = resultByRoom.get(room.id);
            const creator = profileById.get(room.creator_id);
            const opponent = room.opponent_id
              ? profileById.get(room.opponent_id)
              : undefined;
            const reporter = result
              ? profileById.get(result.reporter_id)
              : undefined;
            const reportedWinner = result
              ? profileById.get(result.winner_id)
              : undefined;

            return (
              <DisputeCard
                key={room.id}
                room={room}
                result={result}
                creator={creator}
                opponent={opponent}
                reporter={reporter}
                reportedWinner={reportedWinner}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
