function CardSkeleton() {
  return (
    <div className="rounded-xl border border-base-border bg-base-surface p-4">
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
  );
}

export default function Loading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-8 w-40 rounded-lg" />
          <div className="skeleton h-4 w-64 rounded-lg" />
        </div>
        <div className="skeleton h-10 w-32 rounded-lg" />
      </div>

      <section className="mt-8">
        <div className="skeleton h-6 w-56 rounded-lg" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>

      <section className="mt-10">
        <div className="skeleton h-6 w-24 rounded-lg" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>
    </div>
  );
}
