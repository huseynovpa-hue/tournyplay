import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push-server";

// Called by the client right after submit_result() succeeds.
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
    .select("id, creator_id, opponent_id, stake, status")
    .eq("id", roomId)
    .single();

  const isParticipant =
    room && (room.creator_id === user.id || room.opponent_id === user.id);

  if (!room || room.status !== "reported" || !isParticipant) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const approverId =
    room.creator_id === user.id ? room.opponent_id : room.creator_id;
  if (!approverId) {
    return NextResponse.json({ ok: true });
  }

  const { data: reporterProfile } = await supabase
    .from("profiles")
    .select("profile_name")
    .eq("id", user.id)
    .single();

  try {
    await sendPushToUser(approverId, {
      title: "Result needs your approval",
      body: `${reporterProfile?.profile_name ?? "Your opponent"} reported the score for your ${room.stake}-token room. Review it now.`,
      url: `/rooms/${room.id}`,
      tag: `room-${room.id}`,
    });
  } catch (err) {
    console.error("Failed to send result notification:", err);
  }

  return NextResponse.json({ ok: true });
}
