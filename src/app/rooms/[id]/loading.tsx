export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-base-border bg-base-surface p-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-6 w-40 rounded-full" />
          <div className="skeleton h-7 w-24 rounded-lg" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-base-border bg-base-raised p-4">
            <div className="skeleton h-3 w-10 rounded" />
            <div className="skeleton mt-2 h-5 w-24 rounded" />
            <div className="skeleton mt-2 h-3 w-28 rounded" />
          </div>
          <div className="rounded-xl border border-base-border bg-base-raised p-4">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton mt-2 h-5 w-24 rounded" />
            <div className="skeleton mt-2 h-3 w-28 rounded" />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <div className="skeleton h-10 w-32 rounded-lg" />
          <div className="skeleton h-10 w-36 rounded-lg" />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-base-border bg-base-surface p-5">
        <div className="skeleton h-5 w-32 rounded" />
        <div className="skeleton mt-3 h-4 w-full rounded" />
        <div className="skeleton mt-2 h-4 w-2/3 rounded" />
      </div>
    </div>
  );
}
