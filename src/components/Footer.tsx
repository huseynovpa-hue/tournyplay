import Link from "next/link";
import { LogoWordmark } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-base-border bg-base-surface/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <LogoWordmark />
          <p className="mt-2 max-w-xs text-sm text-ink-dim">
            Create or join eFootball Mobile friendly-match rooms, stake
            tokens, and compete for the pot.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-dim">
          <Link href="/rules" className="hover:text-pitch">
            Rules
          </Link>
          <Link href="/about" className="hover:text-pitch">
            About Us
          </Link>
          <Link href="/privacy" className="hover:text-pitch">
            Privacy Policy
          </Link>
          <Link href="/contact" className="hover:text-pitch">
            Contact Us
          </Link>
        </nav>
      </div>

      <div className="border-t border-base-border">
        <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-ink-faint sm:px-6">
          © {year} TournyPlay. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
