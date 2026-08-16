import type { RoomStatus } from "@/types/database";

const STYLES: Record<RoomStatus, string> = {
  open: "bg-volt/15 text-volt border-volt/30",
  full: "bg-warn/15 text-warn border-warn/30",
  reported: "bg-warn/15 text-warn border-warn/30",
  completed: "bg-pitch/15 text-pitch border-pitch/30",
  disputed: "bg-danger/15 text-danger border-danger/30",
  expired: "bg-ink-faint/15 text-ink-faint border-ink-faint/30",
  cancelled: "bg-ink-faint/15 text-ink-faint border-ink-faint/30",
};

const LABELS: Record<RoomStatus, string> = {
  open: "Waiting for opponent",
  full: "Match in progress",
  reported: "Result submitted",
  completed: "Completed",
  disputed: "Disputed",
  expired: "Expired — refunded",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: RoomStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}
    >
      {(status === "open" || status === "full") && (
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {LABELS[status]}
    </span>
  );
}
