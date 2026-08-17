export default function Loading() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="skeleton h-8 w-48 rounded-lg" />
      <div className="skeleton mt-2 h-4 w-72 rounded-lg" />

      <div className="mt-6 rounded-xl border border-base-border bg-base-surface p-5">
        <div className="skeleton h-4 w-28 rounded" />
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-10 rounded-lg" />
          ))}
        </div>
        <div className="skeleton mt-4 h-10 w-full rounded-lg" />
        <div className="skeleton mt-4 h-12 w-full rounded-lg" />
      </div>

      <div className="skeleton mt-5 h-16 w-full rounded-xl" />
      <div className="skeleton mt-6 h-12 w-full rounded-lg" />
    </div>
  );
}
