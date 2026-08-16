export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Controller body */}
      <path
        d="M9 20c0-4.5 3.4-8 8.4-8h13.2c5 0 8.4 3.5 8.4 8v6c0 5-3.6 9-8 9-2 0-3-1-4.5-2.6-1.3-1.4-2-2.1-3.5-2.1h-1.6c-1.5 0-2.2.7-3.5 2.1C16.5 34 15.5 35 13.5 35c-4.4 0-8-4-8-9v-6Z"
        fill="#131922"
        stroke="#39D97C"
        strokeWidth="2.2"
      />
      {/* D-pad */}
      <path
        d="M15.5 20.5v5M13 23h5"
        stroke="#EAF0F6"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Action buttons (styled as a mini football) */}
      <circle cx="32.5" cy="23" r="3.4" fill="#0A0E13" stroke="#4C8DFF" strokeWidth="1.6" />
      <path
        d="M32.5 20.6l1.4 1-.5 1.6h-1.8l-.5-1.6 1.4-1Z"
        fill="#4C8DFF"
      />
      {/* Antenna / signal ping to suggest live match */}
      <circle cx="38.5" cy="10.5" r="2.4" fill="#39D97C" />
    </svg>
  );
}

export function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoMark />
      <span className="font-display text-xl font-bold tracking-wide text-ink">
        TOURNY<span className="text-pitch">PLAY</span>
      </span>
    </div>
  );
}
