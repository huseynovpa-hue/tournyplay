"use client";

import { useEffect, useState } from "react";

export function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(
    new Date(expiresAt).getTime() - Date.now()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(new Date(expiresAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (remaining <= 0) {
    return (
      <span className="font-display font-bold text-danger">
        Time&apos;s up — awaiting refund
      </span>
    );
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <span className="font-display font-bold text-warn">
      {minutes}:{seconds.toString().padStart(2, "0")} left to report a result
    </span>
  );
}
