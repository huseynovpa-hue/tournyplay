"use client";

import { useEffect, useState } from "react";
import {
  getExistingSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";

export function NotificationBell() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPushSupported()) return;
    setSupported(true);
    getExistingSubscription()
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {});
  }, []);

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
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition disabled:opacity-60 ${
          subscribed
            ? "border-pitch/40 bg-pitch/10 text-pitch"
            : "border-base-border bg-base-surface text-ink-dim hover:text-ink"
        }`}
      >
        {subscribed ? <BellOnIcon /> : <BellOffIcon />}
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
