"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getExistingSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";
import type { AppNotification } from "@/types/database";

const MAX_SHOWN = 20;

export function NotificationBell({ userId }: { userId: string }) {
  const supabase = createClient();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  // Initial load + realtime subscription for this user's notifications.
  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(MAX_SHOWN);

      const { count: unread } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("read_at", null);

      if (!active) return;
      setItems((data as AppNotification[]) ?? []);
      setUnreadCount(unread ?? 0);
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const n = payload.new as AppNotification;
          setItems((prev) => [n, ...prev].slice(0, MAX_SHOWN));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const n = payload.new as AppNotification;
          setItems((prev) => prev.map((i) => (i.id === n.id ? n : i)));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Push-notification opt-in state (unchanged behavior, just moved into
  // the dropdown instead of being the bell's only job).
  useEffect(() => {
    if (!isPushSupported()) return;
    setPushSupported(true);
    getExistingSubscription()
      .then((sub) => setPushSubscribed(!!sub))
      .catch(() => {});
  }, []);

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function handleOpen() {
    const willOpen = !open;
    setOpen(willOpen);
    if (!willOpen || unreadCount === 0) return;

    // Mark everything currently unread as read as soon as the dropdown
    // is opened, and clear the badge immediately for a snappy feel.
    const idsToMark = items.filter((i) => !i.read_at).map((i) => i.id);
    setUnreadCount(0);
    setItems((prev) =>
      prev.map((i) => (i.read_at ? i : { ...i, read_at: new Date().toISOString() }))
    );
    if (idsToMark.length > 0) {
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .in("id", idsToMark)
        .eq("user_id", userId);
    }
  }

  async function togglePush() {
    setPushBusy(true);
    setPushError(null);
    try {
      if (pushSubscribed) {
        await unsubscribeFromPush();
        setPushSubscribed(false);
      } else {
        await subscribeToPush();
        setPushSubscribed(true);
      }
    } catch (err) {
      setPushError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPushBusy(false);
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        aria-expanded={open}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition ${
          open
            ? "border-pitch/40 bg-pitch/10 text-pitch"
            : "border-base-border bg-base-surface text-ink-dim hover:text-ink"
        }`}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full border border-base bg-danger px-1 font-display text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-40 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-base-border bg-base-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-base-border px-3.5 py-2.5">
            <p className="font-display text-sm font-bold text-ink">
              Notifications
            </p>
            {pushSupported && (
              <button
                onClick={togglePush}
                disabled={pushBusy}
                className={`text-xs font-semibold disabled:opacity-60 ${
                  pushSubscribed ? "text-pitch" : "text-ink-faint hover:text-ink"
                }`}
              >
                {pushSubscribed ? "Push on" : "Turn on push"}
              </button>
            )}
          </div>

          {pushError && (
            <p className="border-b border-base-border bg-danger/10 px-3.5 py-2 text-xs text-danger">
              {pushError}
            </p>
          )}

          <div className="scrollbar-thin max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-3.5 py-6 text-center text-xs text-ink-faint">
                Loading…
              </p>
            ) : items.length === 0 ? (
              <p className="px-3.5 py-6 text-center text-xs text-ink-faint">
                Nothing yet. We&apos;ll let you know when someone joins your
                room or sends a message.
              </p>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  href={`/rooms/${n.room_id}`}
                  onClick={() => setOpen(false)}
                  className={`block border-b border-base-border px-3.5 py-2.5 text-sm transition last:border-b-0 hover:bg-base-raised ${
                    !n.read_at ? "bg-pitch/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read_at && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-ink-faint text-[11px] uppercase tracking-wide">
                        {n.type === "room_joined" ? "Room joined" : "New message"}
                      </p>
                      <p className="text-ink">{n.body}</p>
                      <p className="mt-0.5 text-[11px] text-ink-faint">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function BellIcon() {
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
