import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/get-user-id";
import { OpenRoomsList } from "@/components/OpenRoomsList";
import type { Room } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();

  // User id already resolved by middleware — no need to call
  // supabase.auth.getUser() again here, saving one round-trip.
  const userId = getUserId();

  const { data: rooms } = await supabase
    .from("rooms")
    .select(
      "*, creator:profiles!rooms_creator_id_fkey(*), opponent:profiles!rooms_opponent_id_fkey(*)"
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .returns<Room[]>();

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-2xl border border-base-border bg-gradient-to-br from-base-surface via-base-surface to-base p-6 shadow-[0_20px_50px_-20px_rgba(57,217,124,0.25)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Open rooms</h1>
          <p className="mt-1 text-ink-dim">
            Stake tokens, challenge another player, and take the pot.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/rules"
            className="btn-3d btn-3d-outline rounded-lg px-4 py-2.5 text-center font-semibold"
          >
            Read the rules
          </Link>
          <Link
            href={userId ? "/rooms/create" : "/signup"}
            className="btn-3d btn-3d-pitch rounded-lg px-5 py-2.5 text-center font-display font-bold"
          >
            + Create a room
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <OpenRoomsList initialRooms={rooms ?? []} currentUserId={userId ?? undefined} />
      </div>
    </div>
  );
}
