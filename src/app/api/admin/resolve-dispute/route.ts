import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push-server";

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const roomId = body?.roomId;
  const winnerId = body?.winnerId;

  if (!roomId || !winnerId) {
    return NextResponse.json(
      { error: "Missing roomId or winnerId" },
      { status: 400 }
    );
  }

  const db = createAdminClient();

  const { data: room } = await db
    .from("rooms")
    .select("id, creator_id, opponent_id, stake, status")
    .eq("id", roomId)
    .single();

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.status !== "disputed") {
    return NextResponse.json(
      { error: "This room is not disputed" },
      { status: 400 }
    );
  }
  if (winnerId !== room.creator_id && winnerId !== room.opponent_id) {
    return NextResponse.json(
      { error: "Winner must be one of the two participants" },
      { status: 400 }
    );
  }

  const { error } = await db.rpc("admin_resolve_dispute", {
    p_room_id: roomId,
    p_winner_id: winnerId,
  });

  if (error) {
    console.error("Failed to resolve dispute:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Best-effort: let both players know the dispute was resolved.
  const loserId =
    winnerId === room.creator_id ? room.opponent_id : room.creator_id;

  await Promise.allSettled([
    sendPushToUser(winnerId, {
      title: "Dispute resolved — you won",
      body: `Our team reviewed the disputed match and awarded you the ${room.stake * 2}-token pot.`,
      url: `/rooms/${room.id}`,
      tag: `room-${room.id}`,
    }),
    loserId
      ? sendPushToUser(loserId, {
          title: "Dispute resolved",
          body: `Our team reviewed the disputed match. Your opponent was awarded the pot.`,
          url: `/rooms/${room.id}`,
          tag: `room-${room.id}`,
        })
      : Promise.resolve(),
  ]).catch(() => {});

  return NextResponse.json({ ok: true });
}
