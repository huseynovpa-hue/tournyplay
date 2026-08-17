export default function Loading() {
  return (
    <div>
      <div className="flex flex-col gap-4 rounded-2xl border border-base-border bg-base-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="skeleton h-8 w-48 rounded-lg" />
          <div className="skeleton h-4 w-72 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="skeleton h-10 w-32 rounded-lg" />
          <div className="skeleton h-10 w-36 rounded-lg" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-base-border bg-base-surface p-4"
          >
            <div className="flex items-center justify-between">
              <div className="skeleton h-6 w-32 rounded-full" />
              <div className="skeleton h-6 w-20 rounded-lg" />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="skeleton h-3 w-10 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
              </div>
              <div className="space-y-1.5 text-right">
                <div className="skeleton ml-auto h-3 w-14 rounded" />
                <div className="skeleton ml-auto h-4 w-20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
