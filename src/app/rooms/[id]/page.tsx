import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/get-user-id";
import { RoomView } from "@/components/RoomView";
import type { Room, RoomResult } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function RoomDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Middleware already redirected unauthenticated visitors away from
  // /rooms/[id] and forwarded the user id via a header — no extra
  // getUser() round trip needed here.
  const userId = getUserId();
  if (!userId) notFound();

  // These two queries don't depend on each other, so fire them together
  // instead of waiting on one before starting the next.
  const [{ data: room }, { data: result }] = await Promise.all([
    supabase
      .from("rooms")
      .select(
        "*, creator:profiles!rooms_creator_id_fkey(*), opponent:profiles!rooms_opponent_id_fkey(*)"
      )
      .eq("id", params.id)
      .single<Room>(),
    supabase
      .from("room_results")
      .select("*")
      .eq("room_id", params.id)
      .maybeSingle<RoomResult>(),
  ]);

  if (!room) notFound();

  return (
    <RoomView
      initialRoom={room}
      initialResult={result ?? null}
      currentUserId={userId}
    />
  );
}
