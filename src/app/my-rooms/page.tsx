import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoomCard } from "@/components/RoomCard";
import type { Room } from "@/types/database";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["open", "full", "reported"];
// "cancelled" rooms are intentionally excluded — a cancelled room never
// really happened (it was refunded before anyone joined), so it shouldn't
// clutter match history.
const HISTORY_STATUSES = ["completed", "expired", "disputed"];

export default async function MyRoomsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/my-rooms");

  const { data: rooms } = await supabase
    .from("rooms")
    .select(
      "*, creator:profiles!rooms_creator_id_fkey(*), opponent:profiles!rooms_opponent_id_fkey(*), result:room_results(*)"
    )
    .or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .returns<Room[]>();

  const active = (rooms ?? []).filter((r) => ACTIVE_STATUSES.includes(r.status));
  const history = (rooms ?? []).filter((r) => HISTORY_STATUSES.includes(r.status));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">My rooms</h1>
          <p className="mt-1 text-ink-dim">
            Rooms you&apos;ve created or joined, kept separate from the open
            browse list.
          </p>
        </div>
        <Link
          href="/rooms/create"
          className="btn-3d btn-3d-pitch rounded-lg px-4 py-2.5 font-display font-bold"
        >
          + New room
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-ink">
          Active & waiting for a result
        </h2>
        {active.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-base-border p-6 text-center text-sm text-ink-dim">
            Nothing active. Join or create a room to get started.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {active.map((room) => (
              <RoomCard key={room.id} room={room} currentUserId={user.id} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-ink">History</h2>
        {history.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-base-border p-6 text-center text-sm text-ink-dim">
            Completed and expired rooms will show up here.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {history.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                currentUserId={user.id}
                showDate
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
