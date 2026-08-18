"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { RoomCard } from "./RoomCard";
import type { Room } from "@/types/database";

export function OpenRoomsList({
  initialRooms,
  currentUserId,
}: {
  initialRooms: Room[];
  currentUserId?: string;
}) {
  const supabase = createClient();
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  // Keep local state in sync if the server-rendered list changes
  // (e.g. on client-side navigation back to this page).
  useEffect(() => {
    setRooms(initialRooms);
  }, [initialRooms]);

  const fetchRoom = useCallback(
    async (roomId: string) => {
      const { data } = await supabase
        .from("rooms")
        .select(
          "*, creator:profiles!rooms_creator_id_fkey(*), opponent:profiles!rooms_opponent_id_fkey(*)"
        )
        .eq("id", roomId)
        .single<Room>();
      return data ?? null;
    },
    [supabase]
  );

  useEffect(() => {
    const channel = supabase
      .channel("open-rooms")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms" },
        async (payload) => {
          const roomId =
            (payload.new as { id?: string } | null)?.id ??
            (payload.old as { id?: string } | null)?.id;
          if (!roomId) return;

          // Deleted rooms (if that ever happens) just get removed.
          if (payload.eventType === "DELETE") {
            setRooms((prev) => prev.filter((r) => r.id !== roomId));
            return;
          }

          // Re-fetch with the profile joins so the card has everything it needs.
          const fresh = await fetchRoom(roomId);

          setRooms((prev) => {
            const withoutRoom = prev.filter((r) => r.id !== roomId);

            if (!fresh || fresh.status !== "open") {
              // No longer open (joined, cancelled, expired, etc.) — drop it.
              return withoutRoom;
            }

            // New or still-open room — add it to the top of the list.
            return [fresh, ...withoutRoom];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchRoom]);

  if (rooms.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-base-border p-10 text-center text-ink-dim">
        No open rooms right now. Be the first to create one.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
