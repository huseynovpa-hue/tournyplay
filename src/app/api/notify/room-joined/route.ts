import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push-server";

// Called by the client right after join_room() succeeds. We re-derive
// everything from the database rather than trusting the request body, so
// the only thing we take from the client is which room to look at.
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const roomId = body?.roomId;
  if (!roomId) {
    return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
  }

  const { data: room } = await supabase
    .from("rooms")
    .select("id, creator_id, opponent_id, stake")
    .eq("id", roomId)
    .single();

  // Only the player who just became the opponent of this room can trigger
  // its "someone joined" notification, and only once (opponent_id is only
  // ever set by join_room, so this can't be replayed for other rooms).
  if (!room || room.opponent_id !== user.id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { data: joinerProfile } = await supabase
    .from("profiles")
    .select("profile_name")
    .eq("id", user.id)
    .single();

  try {
    await sendPushToUser(room.creator_id, {
      title: "Someone joined your room",
      body: `${joinerProfile?.profile_name ?? "A player"} joined your ${room.stake}-token room. Share the match room ID to get started.`,
      url: `/rooms/${room.id}`,
      tag: `room-${room.id}`,
    });
  } catch (err) {
    console.error("Failed to send join notification:", err);
  }

  return NextResponse.json({ ok: true });
}
