# TournyPlay

A web app where eFootball Mobile players create or join 1v1 "rooms," stake
tokens (not real money), play a real friendly match in the game, and report
the result for the winner to collect the pot.

This guide assumes **zero coding experience**. Follow it top to bottom, in
order. It takes about 30–45 minutes the first time.

---

## What you're setting up

1. **GitHub** — stores your code.
2. **Supabase** — your database, user accounts, and image storage.
3. **Vercel** — hosts the live website and connects to GitHub so every
   update you make gets published automatically.

---

## Step 1 — Create a GitHub repository

1. Go to https://github.com and log in (create a free account if you don't
   have one).
2. Click the **+** icon top-right → **New repository**.
3. Name it `tournyplay`. Keep it **Private** for now. Click **Create repository**.
4. On the next page, click **uploading an existing file**.
5. Drag in **every file and folder** from the project you downloaded from
   this chat (keep the folder structure — `src`, `supabase`, `package.json`,
   etc. should all be at the top level of the repo).
6. Scroll down, click **Commit changes**.

> Don't upload the `.env.local` file if you create one later — it contains
> secret keys. It's already excluded in `.gitignore`.

---

## Step 2 — Create your Supabase project

1. Go to https://supabase.com → **Start your project** → sign in.
2. Click **New project**. Pick any name (e.g. `tournyplay`), set a database
   password (save it somewhere), choose the region closest to your players,
   click **Create new project**. Wait ~2 minutes while it provisions.
3. In the left sidebar, open **SQL Editor** → **New query**.
4. Open the file `supabase/schema.sql` from your project, copy **all** of
   it, paste it into the SQL editor, and click **Run**. You should see
   "Success. No rows returned."
5. New query again. Open `supabase/storage.sql`, copy all of it, paste it
   in, and click **Run**.
5b. New query again. Open `supabase/migration_002.sql`, copy all of it,
   paste it in, and click **Run**. Then do the same for
   `supabase/migration_003.sql`. These add room lifecycle columns, the
   dispute flow, push notification subscriptions, and the leaderboard/stats
   functions — run them in that order, after `schema.sql`.
6. (Recommended) Turn on scheduled refunds:
   - Left sidebar → **Database** → **Extensions** → search `pg_cron` →
     enable it.
   - Go back to **SQL Editor** → **New query** and run:
     ```sql
     select cron.schedule(
       'expire-stale-rooms',
       '*/5 * * * *',
       $$ select public.expire_stale_rooms(); $$
     );
     ```
   - This checks every 5 minutes for rooms that have been running longer
     than 1 hour with no approved result, and refunds both players
     automatically.
7. Turn off "confirm email" if you want people to be able to sign up and
   use the app immediately without clicking an email link (optional, easier
   for testing): **Authentication** → **Providers** → **Email** → turn off
   **Confirm email**. You can turn it back on later for production.
8. Get your API keys: **Project Settings** (gear icon) → **API**. You'll
   need:
   - **Project URL**
   - **anon public** key
   - **service_role** key (needed for push notifications — see below.
     Treat it like a password; it bypasses all database security rules)

Keep this tab open — you'll paste these into Vercel in Step 4.

---

## Step 3 — Push the code to GitHub via Vercel (no local setup needed)

You don't need to install anything on your computer. Vercel builds the
code for you.

---

## Step 4 — Deploy to Vercel

1. Go to https://vercel.com → sign up/log in, ideally **with your GitHub
   account** so they connect automatically.
2. Click **Add New** → **Project**.
3. Find your `tournyplay` repository and click **Import**.
4. Before deploying, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | the Project URL from Step 2.8 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the anon public key from Step 2.8 |
   | `SUPABASE_SERVICE_ROLE_KEY` | the **service_role** key from Step 2.8 (Project Settings → API). Keep this secret — never prefix it with `NEXT_PUBLIC_`. |
   | `NEXT_PUBLIC_TOKENS_PER_DOLLAR` | `100` (or whatever rate you want) |
   | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | see "Push notifications" below |
   | `VAPID_PRIVATE_KEY` | see "Push notifications" below |
   | `VAPID_SUBJECT` | `mailto:you@example.com` |

5. Click **Deploy**. Wait a minute or two — you'll get a live URL like
   `https://tournyplay.vercel.app`.

That's it — the site is live. Every time you (or I, in future messages)
update the code and push it to GitHub, Vercel redeploys automatically.

---

## Step 5 — Try it out

1. Open your Vercel URL, click **Sign up**, create two test accounts (use
   two different emails — a free Gmail "+" trick works, e.g.
   `you+p1@gmail.com` and `you+p2@gmail.com`).
2. New accounts start with **0 tokens**. To test, give yourself tokens
   manually: Supabase → **Table editor** → `profiles` → find your row →
   edit `token_balance` → save.
3. Log in as player 1, create a room. Log in as player 2 (or use a private
   browser window), join it. Try the chat, result reporting, and approval
   flow.

---

## How the token economy works (current setup)

- Tokens are **not real-money gambling** — they're an internal currency.
- Suggested starting rate: **100 tokens = $1** (adjustable via the
  `NEXT_PUBLIC_TOKENS_PER_DOLLAR` environment variable — this only affects
  the price shown on screen, see the Payments section below for actually
  charging money).
- Suggested room sizes to launch with: **10 / 20 / 50 / 100 / 200 tokens**.
  Users can also enter a custom amount. You can change the presets in
  `src/app/rooms/create/page.tsx` (`PRESET_STAKES`).
- When a room is created, the stake is deducted immediately and held. When
  someone joins, their stake is deducted too. When a result is approved,
  the full pot (2x stake) goes to the winner. If nobody joins, the creator
  can cancel and get an instant refund. If a room fills up but no result is
  approved within 1 hour, both stakes are refunded automatically.

## What's NOT wired up yet (on purpose, for you to decide on later)

- **Real payments.** The "Buy tokens" section on the Profile page currently
  shows prices but the buttons are disabled ("Coming soon"). To accept real
  money, the most common next step is **Stripe Checkout**: you'd create a
  Vercel serverless route that creates a Stripe Checkout session for a
  token pack, and a webhook that credits `token_balance` when payment
  succeeds. I can build this next — just ask.
- **Manual dispute resolution.** If a result is disputed, there's currently
  no admin screen to override it. For now, disputed/expired rooms just sit
  there refunded or flagged. I can add a simple admin page next.

---

## Push notifications

Notifies a room's host when someone joins, and notifies whoever needs to
respond when a result is submitted, using the browser's Web Push API (a
small bell icon in the navbar turns it on/off per device).

1. Generate a VAPID key pair (one time, not per-deploy):
   ```
   npx web-push generate-vapid-keys
   ```
   This prints a **Public Key** and a **Private Key**.
2. Add these environment variables in Vercel (see Step 4 above):
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` → the Public Key
   - `VAPID_PRIVATE_KEY` → the Private Key
   - `VAPID_SUBJECT` → `mailto:you@example.com` (any contact email; used by
     push services to reach you if something's wrong)
   - `SUPABASE_SERVICE_ROLE_KEY` → the service_role key from Step 2.8
3. Make sure `supabase/migration_003.sql` has been run (creates the
   `push_subscriptions` table).
4. Push notifications require HTTPS, so they'll work on your Vercel URL but
   not on plain `http://localhost` in most browsers — test on the deployed
   site, or use `localhost` itself (Chrome allows it as a special case).
5. Each signed-in user clicks the bell icon in the navbar once to opt in;
   their browser subscription is saved per-device. No email step needed.

---

## Leaderboard & player stats

- `/leaderboard` ranks every player who has at least one approved match by
  wins, win rate, and total tokens won.
- Every player has a `/players/[id]` page (linked from the leaderboard, the
  Profile page, and room host/opponent names) showing their stats and full
  match history.
- All of this is computed live from `rooms` + `room_results` via SQL
  functions in `supabase/migration_003.sql` — no separate stats table to
  keep in sync.

---

## Project structure (for reference)

```
src/app/                     Pages (signup, login, rooms, my-rooms, profile, leaderboard, players, rules)
src/app/api/push/            Save/remove a browser's push subscription
src/app/api/notify/          Triggers the two push notifications (room joined, result submitted)
src/components/              Reusable UI (Navbar, RoomCard, RoomChat, ResultPanel, LeaderboardTable, MatchHistoryList...)
src/lib/supabase/            Supabase client setup (browser, server, middleware, admin/service-role)
src/lib/push-client.ts       Browser-side subscribe/unsubscribe helpers
src/lib/push-server.ts       Server-side "send a push to this user" helper
public/sw.js                 Service worker that shows/handles push notifications
src/types/                   Shared TypeScript types
supabase/schema.sql          Database tables, security rules, and game-logic functions
supabase/migration_002.sql   Room lifecycle (room ID, start/finish) + dispute flow
supabase/migration_003.sql   Push subscriptions table + leaderboard/stats functions
supabase/storage.sql         Screenshot storage bucket + access rules
```

## Making changes later

Just describe what you want changed in this chat, and I'll give you updated
files. To publish an update:
1. In GitHub, open the file that changed → pencil icon (Edit) → paste the
   new content → **Commit changes**.
   (Or delete the old file and re-upload the new one via "Add file" →
   "Upload files".)
2. Vercel redeploys automatically within a minute.

For bigger batches of changes, I can also give you a full updated zip of
the project to re-upload.
