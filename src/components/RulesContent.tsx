const MATCH_SETTINGS = [
  ["Match type", "Standard"],
  ["Match time", "10 minutes"],
  ["Injuries", "Open"],
  ["Extra time", "Open"],
  ["Penalties", "Open"],
  ["No. of substitutions", "5"],
  ["No. of substitution intervals", "5"],
  ["+1 sub in extra time", "Open"],
  ["Condition — Home", "Excellent"],
  ["Condition — Away", "Excellent"],
];

export function RulesContent() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm font-semibold text-warn">
        ⚠ Read the rules carefully before joining the match.
      </div>

      <section>
        <h2 className="font-display text-xl font-bold text-ink">
          1. In-game match settings
        </h2>
        <p className="mt-1 text-sm text-ink-dim">
          Both players must set up the friendly match in the eFootball Mobile
          app using these exact settings before kickoff.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-base-border">
          <table className="w-full text-sm">
            <tbody>
              {MATCH_SETTINGS.map(([label, value], i) => (
                <tr
                  key={label}
                  className={i % 2 === 0 ? "bg-base-surface" : "bg-base-raised"}
                >
                  <td className="px-4 py-2.5 text-ink-dim">{label}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-ink">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-ink">
          2. Before kickoff
        </h2>
        <ul className="mt-3 space-y-2.5 text-sm text-ink-dim">
          <li>
            <span className="font-semibold text-ink">Usernames must match. </span>
            The eFootball username on your TournyPlay profile must be the
            exact username you use in the eFootball Mobile app.
          </li>
          <li>
            <span className="font-semibold text-ink">
              Coordinate in the room chat.
            </span>{" "}
            Once a room is full, use the chat inside the room to talk to your
            opponent and agree on when to play.
          </li>
          <li>
            <span className="font-semibold text-ink">
              The room creator shares the Friendly Match Room ID.
            </span>{" "}
            Open eFootball Mobile, create a Friendly Match, and type the Room
            ID it gives you directly into the TournyPlay room chat. The
            opponent copies that ID and searches for it inside the eFootball
            app to join. TournyPlay does not generate this ID — it always
            comes from the real game.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-ink">
          3. Playing the match
        </h2>
        <ul className="mt-3 space-y-2.5 text-sm text-ink-dim">
          <li>
            You have <span className="font-semibold text-ink">1 hour</span>{" "}
            from the moment the room fills up to finish the match and report
            the result.
          </li>
          <li>
            If no result is reported and approved within that hour, the room
            expires automatically and both players&apos; tokens are refunded
            in full.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-ink">
          4. Reporting the result
        </h2>
        <ul className="mt-3 space-y-2.5 text-sm text-ink-dim">
          <li>
            After the match, the{" "}
            <span className="font-semibold text-ink">winner</span> reports
            the result: final score and a screenshot.
          </li>
          <li>
            The screenshot must come from{" "}
            <span className="font-semibold text-ink">
              eFootball Mobile → Extras → User Information → Match History
            </span>{" "}
            and clearly show the final score.
          </li>
          <li>
            The <span className="font-semibold text-ink">loser</span> then
            reviews and approves the result in the room. Once approved, the
            full token pot is credited to the winner&apos;s balance.
          </li>
          <li>
            Reporting a false result or refusing to approve a correct result
            is against the rules and may lead to your account being
            suspended.
          </li>
        </ul>
      </section>
    </div>
  );
}
