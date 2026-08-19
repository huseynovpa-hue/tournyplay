# TournyPlay — Roadmap / To-dos

## Done in this version (v1)
- [x] Sign up with two separate usernames: profile name (anything) and
      eFootball Mobile username (with warning note it must match).
- [x] "My Rooms" is a separate page from the open-room browse list, split
      into Active/Waiting and History.
- [x] Room creator shares the real in-game Room ID by typing it into the
      room chat — nothing is auto-generated.
- [x] Room detail page clearly shows both host and opponent eFootball
      usernames.
- [x] Rules page + warning banner + required checkbox before creating a
      room, covering match settings and result-reporting rules.
- [x] Winner reports score + uploads a Match History screenshot; the other
      player approves before tokens move.
- [x] 1-hour timer once a room fills, with automatic refund function
      (`expire_stale_rooms`, hook up via pg_cron — see README).
- [x] Token balance shown clearly in the navbar and profile; profile page
      redesigned with proper contrast (no more white-on-white "Account"
      text).
- [x] "TournyPlay" branding + controller/football logo mark.

## Recommended next steps
- [ ] **Stripe integration** for real token purchases (currently a
      disabled "Coming soon" UI on the Profile page).
- [ ] **Admin dashboard**: view disputed/expired rooms, manually credit or
      refund tokens, ban abusive accounts.
- [ ] **Dispute flow**: right now the opponent can only Approve. Consider
      adding a "Dispute" button that flags the room for manual review
      instead of silently expiring.
- [ ] **Rate limiting / abuse prevention**: cap how many open rooms one
      account can have at once, and cap messages per minute in chat.
- [x] **Notifications**: push alert when someone joins your room, or when
      a result needs your approval. See "Push notifications" in README.md
      for setup (VAPID keys + `migration_003.sql`).
- [ ] **Mobile app wrapper** (optional): once the web app is stable, it can
      be wrapped for iOS/Android if you want an app-store presence.
- [x] **Leaderboards / stats**: win rate, total tokens won, per-player
      match history page. See `/leaderboard` and `/players/[id]`.
- [ ] Decide on a small **house rake** (e.g. 5% of the pot) if you want the
      platform to earn revenue beyond token sales — easy to add inside
      `approve_result` in `supabase/schema.sql`.

## Open questions for you
1. Starting room stake presets — keep 10/20/50/100/200 tokens, or change?
2. Should new accounts get a small free token welcome bonus (e.g. 50
   tokens) to encourage first use?
3. Do you want a house rake on winnings, or 100% to the winner (current
   setting)?
4. Any age/region restrictions you want enforced at signup?
