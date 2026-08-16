import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto mt-20 max-w-md text-center">
      <h1 className="font-display text-4xl font-bold text-pitch">404</h1>
      <p className="mt-2 text-ink-dim">
        This page doesn&apos;t exist, or you need to log in to see it.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-pitch px-5 py-2.5 font-semibold text-base"
      >
        Back to open rooms
      </Link>
    </div>
  );
}
