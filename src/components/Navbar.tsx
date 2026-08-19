"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogoWordmark } from "./Logo";
import { NotificationBell } from "./NotificationBell";

export function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    profile_name: string;
    token_balance: number;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (active) {
          setProfile(null);
          setUserId(null);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("profile_name, token_balance")
        .eq("id", user.id)
        .single();
      if (active) {
        setProfile(data);
        setUserId(user.id);
        setLoading(false);
      }
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-base-border bg-base/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/">
          <LogoWordmark />
        </Link>

        <nav className="hidden items-center gap-6 font-display text-sm font-semibold uppercase tracking-wide text-ink-dim sm:flex">
          <Link href="/" className="hover:text-pitch">
            Open Rooms
          </Link>
          {profile && (
            <Link href="/my-rooms" className="hover:text-pitch">
              My Rooms
            </Link>
          )}
          <Link href="/leaderboard" className="hover:text-pitch">
            Leaderboard
          </Link>
          <Link href="/rules" className="hover:text-pitch">
            Rules
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? null : profile && userId ? (
            <>
              <NotificationBell userId={userId} />
              <Link
                href="/profile"
                className="hidden items-center gap-1.5 rounded-full border border-base-border bg-base-surface px-3 py-1.5 text-sm font-semibold text-pitch sm:flex"
              >
                {profile.token_balance.toLocaleString()} tokens
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-ink hover:text-pitch"
              >
                {profile.profile_name}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-base-border px-3 py-1.5 text-sm font-medium text-ink-dim hover:border-danger hover:text-danger"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-ink-dim hover:text-ink"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="btn-3d btn-3d-pitch rounded-lg px-4 py-1.5 text-sm font-semibold"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
