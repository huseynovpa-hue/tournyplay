import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoomView } from "@/components/RoomView";
import type { Room, RoomResult } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function RoomDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: room } = await supabase
    .from("rooms")
    .select(
      "*, creator:profiles!rooms_creator_id_fkey(*), opponent:profiles!rooms_opponent_id_fkey(*)"
    )
    .eq("id", params.id)
    .single<Room>();

  if (!room) notFound();

  const { data: result } = await supabase
    .from("room_results")
    .select("*")
    .eq("room_id", params.id)
    .maybeSingle<RoomResult>();

  return (
    <RoomView
      initialRoom={room}
      initialResult={result ?? null}
      currentUserId={user.id}
    />
  );
}
