"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RoomMessage } from "@/types/database";

export function RoomChat({
  roomId,
  currentUserId,
  senderNames,
}: {
  roomId: string;
  currentUserId: string;
  senderNames: Record<string, string>;
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef<Set<string>>(new Set());

  function addMessage(m: RoomMessage) {
    if (seenIds.current.has(m.id)) return;
    seenIds.current.add(m.id);
    setMessages((prev) => [...prev, m]);
  }

  useEffect(() => {
    let active = true;

    async function loadMessages() {
      const { data } = await supabase
        .from("room_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });
      if (active && data) {
        data.forEach((m) => seenIds.current.add(m.id));
        setMessages(data);
      }
    }
    loadMessages();

    const channel = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "room_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          addMessage(payload.new as RoomMessage);
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    const { data, error } = await supabase
      .from("room_messages")
      .insert({
        room_id: roomId,
        sender_id: currentUserId,
        message: trimmed,
      })
      .select()
      .single();
    setSending(false);
    if (!error) {
      setText("");
      if (data) addMessage(data as RoomMessage);
    }
  }

  return (
    <div className="flex h-[420px] flex-col rounded-xl border border-base-border bg-base-surface">
      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="mt-10 text-center text-sm text-ink-faint">
            No messages yet. Say hello to your opponent.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <span className="mb-0.5 text-xs text-ink-faint">
                  {senderNames[m.sender_id] ?? "Player"}
                </span>
                <span
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                    mine
                      ? "bg-pitch text-base"
                      : "bg-base-raised text-ink"
                  }`}
                >
                  {m.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex gap-2 border-t border-base-border p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message…"
          className="flex-1 rounded-lg border border-base-border bg-base-raised px-3.5 py-2 text-sm text-ink outline-none focus:border-pitch"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="btn-3d btn-3d-pitch rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
