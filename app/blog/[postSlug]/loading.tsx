export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <section className="pt-24 pb-12 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4">
          <div className="h-4 w-32 bg-muted animate-pulse rounded mb-8" />
          <div className="h-6 w-24 bg-muted animate-pulse rounded mb-4" />
          <div className="h-12 w-full bg-muted animate-pulse rounded mb-4" />
          <div className="h-12 w-3/4 bg-muted animate-pulse rounded mb-6" />
          <div className="h-6 w-full bg-muted animate-pulse rounded mb-2" />
          <div className="h-6 w-2/3 bg-muted animate-pulse rounded mb-6" />
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
              <div>
                <div className="h-4 w-32 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="space-y-4">
            <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-32 w-full bg-muted animate-pulse rounded my-6" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
            <div className="h-6 w-1/3 bg-muted animate-pulse rounded mt-8" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
          </div>
        </div>
      </section>
    </div>
  )
}
