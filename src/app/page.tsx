import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RoomCard } from "@/components/RoomCard";
import type { Room } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
            href={user ? "/rooms/create" : "/signup"}
            className="btn-3d btn-3d-pitch rounded-lg px-5 py-2.5 text-center font-display font-bold"
          >
            + Create a room
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {!rooms || rooms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-base-border p-10 text-center text-ink-dim">
            No open rooms right now. Be the first to create one.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} currentUserId={user?.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
