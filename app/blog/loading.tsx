export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <section className="pt-24 pb-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-xl bg-muted animate-pulse mb-6" />
            <div className="h-12 w-64 bg-muted animate-pulse rounded mb-4" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded mb-4" />
            <div className="h-4 w-80 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
            {/* Posts skeleton */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-8 w-3/4 bg-muted animate-pulse rounded mb-3" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-2/3 bg-muted animate-pulse rounded mb-4" />
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar skeleton */}
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="h-4 w-20 bg-muted animate-pulse rounded mb-3" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="h-4 w-24 bg-muted animate-pulse rounded mb-3" />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-full bg-muted animate-pulse rounded mb-1" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
