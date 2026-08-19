"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getExistingSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";

// Other components (e.g. RoomChat, after marking a room read) dispatch this
// on `window` so the bell refreshes its count immediately instead of
// waiting for the next realtime event.
export const UNREAD_REFRESH_EVENT = "tournyplay:unread-refresh";

export function NotificationBell() {
  const supabase = createClient();
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isPushSupported()) {
      setSupported(true);
      getExistingSubscription()
        .then((sub) => setSubscribed(!!sub))
        .catch(() => {});
    }

    let active = true;

    async function fetchUnreadCount() {
      const { data, error: rpcError } = await supabase.rpc(
        "get_unread_notifications_count"
      );
      if (active && !rpcError && typeof data === "number") {
        setUnreadCount(data);
      }
    }

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active || !user) return;
      userIdRef.current = user.id;
      await fetchUnreadCount();
    }

    init();

    // New chat message anywhere -> re-check (RLS already limits realtime
    // delivery to rooms this user participates in).
    const messagesChannel = supabase
      .channel("notification-bell-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "room_messages" },
        (payload) => {
          const senderId = (payload.new as { sender_id?: string })
            ?.sender_id;
          if (senderId && senderId !== userIdRef.current) {
            fetchUnreadCount();
          }
        }
      )
      .subscribe();

    // A room I'm in changed (e.g. someone joined a room I created) ->
    // re-check.
    const roomsChannel = supabase
      .channel("notification-bell-rooms")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms" },
        (payload) => {
          const room = payload.new as {
            creator_id?: string;
            opponent_id?: string | null;
          };
          if (room.creator_id === userIdRef.current && room.opponent_id) {
            fetchUnreadCount();
          }
        }
      )
      .subscribe();

    function onLocalRefresh() {
      fetchUnreadCount();
    }
    window.addEventListener(UNREAD_REFRESH_EVENT, onLocalRefresh);

    return () => {
      active = false;
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(roomsChannel);
      window.removeEventListener(UNREAD_REFRESH_EVENT, onLocalRefresh);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      if (subscribed) {
        await unsubscribeFromPush();
        setSubscribed(false);
      } else {
        await subscribeToPush();
        setSubscribed(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;

  return (
    <div className="relative">
      <button
        onClick={toggle}
        disabled={busy}
        title={
          subscribed
            ? "Notifications are on — click to turn off"
            : "Turn on push notifications"
        }
        aria-label="Toggle push notifications"
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition disabled:opacity-60 ${
          subscribed
            ? "border-pitch/40 bg-pitch/10 text-pitch"
            : "border-base-border bg-base-surface text-ink-dim hover:text-ink"
        }`}
      >
        {subscribed ? <BellOnIcon /> : <BellOffIcon />}
        {unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} unread notifications`}
            className="absolute -right-1 -top-1 flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full border border-base bg-danger px-1 text-[10px] font-bold leading-none text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {error && (
        <p className="absolute right-0 top-11 z-40 w-56 rounded-lg border border-danger/40 bg-base-surface p-2.5 text-xs text-danger shadow-lg">
          {error}
        </p>
      )}
    </div>
  );
}

function BellOnIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function BellOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.7 3A6 6 0 0 1 18 8c0 4.2 1 6.7 1.9 8" />
      <path d="M6.3 6.3C6.1 6.9 6 7.6 6 8c0 7-3 9-3 9h13" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      <path d="M2 2l20 20" />
    </svg>
  );
}
