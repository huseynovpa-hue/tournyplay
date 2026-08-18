/**
 * Global eFootball-style pitch background.
 *
 * Rendered once in the root layout, fixed behind all page content.
 * Kept deliberately subtle (low opacity, muted colors, blurred edges)
 * so it reads as texture/atmosphere rather than competing with
 * foreground cards and text on every page.
 */
export function PitchBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-base"
    >
      {/* Base grass gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,#0f1c15_0%,#0a0e13_55%,#0a0e13_100%)]" />

      {/* Mowed-grass stripes across the whole pitch */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(100deg, #39D97C 0px, #39D97C 120px, transparent 120px, transparent 240px)",
        }}
      />

      {/* Pitch markings: halfway line + center circle, anchored low so they read as a far-off pitch */}
      <svg
        className="absolute left-1/2 top-[62vh] w-[1400px] max-w-none -translate-x-1/2 opacity-[0.07] sm:top-[55vh]"
        viewBox="0 0 1400 700"
        fill="none"
      >
        <line x1="700" y1="0" x2="700" y2="700" stroke="#EAF0F6" strokeWidth="2" />
        <circle cx="700" cy="350" r="140" stroke="#EAF0F6" strokeWidth="2" />
        <circle cx="700" cy="350" r="4" fill="#EAF0F6" />
        <path d="M0 20 H180 V680 H0" stroke="#EAF0F6" strokeWidth="2" />
        <path d="M1400 20 H1220 V680 H1400" stroke="#EAF0F6" strokeWidth="2" />
      </svg>

      {/* Stadium floodlight glows */}
      <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-pitch/10 blur-[120px]" />
      <div className="absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-volt/10 blur-[120px]" />

      {/* Vignette to keep edges dark and content legible */}
      <div className="absolute inset-0 bg-[radial-gradient(90%_75%_at_50%_35%,transparent_0%,transparent_45%,#0a0e13_100%)]" />
    </div>
  );
}
