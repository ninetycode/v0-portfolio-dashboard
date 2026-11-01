import type { ReactNode } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HomeFooter } from "@/components/home-footer"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

function Block({ className }: { className?: string }) {
  return <Skeleton className={cn("bg-accent", className)} />
}

function slots(prefix: string, count: number) {
  return Array.from({ length: count }, (_, index) => `${prefix}-${index}`)
}

export function SiteLoading({
  label,
  children,
  variant = "page",
}: {
  label: string
  children: ReactNode
  variant?: "home" | "page" | "bare"
}) {
  return (
    <div className="relative min-h-screen bg-background">
      <div role="status" aria-live="polite" aria-busy="true" className="sr-only">
        {label}
      </div>
      <Navbar />
      <main aria-hidden="true" className={variant === "page" ? "pt-16 pb-12" : variant === "home" ? "pb-12" : undefined}>
        {children}
      </main>
      {variant === "home" ? <HomeFooter /> : <Footer />}
    </div>
  )
}

function SectionHeading() {
  return (
    <div className="mb-12">
      <div className="mb-4 flex items-center gap-3">
        <Block className="h-10 w-10 rounded-md" />
        <Block className="h-8 w-48 max-w-[60%]" />
      </div>
      <Block className="h-4 w-full max-w-2xl" />
    </div>
  )
}

function CoverCard({ rounded = "rounded-lg" }: { rounded?: string }) {
  return (
    <article className={cn("overflow-hidden border border-border/50 bg-card", rounded)}>
      <Block className="aspect-video w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Block className="h-6 w-2/3" />
        <Block className="h-4 w-full" />
        <Block className="h-4 w-4/5" />
        <div className="flex gap-2">
          <Block className="h-5 w-14 rounded-full" />
          <Block className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </article>
  )
}

export function HomeSkeleton() {
  return (
    <>
      <section className="relative flex min-h-screen items-center justify-center pt-24 pb-16 md:pt-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 text-center">
          <Block className="mb-6 h-8 w-44 rounded-full" />
          <div className="relative mb-8 h-48 w-48 md:h-60 md:w-60">
            <Block className="h-full w-full rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner aria-hidden="true" role="presentation" className="size-6 text-muted-foreground" />
            </div>
          </div>
          <Block className="mb-3 h-10 w-72 max-w-full md:h-14 md:w-[28rem]" />
          <Block className="mb-4 h-10 w-56 max-w-full md:h-14" />
          <Block className="mb-6 h-5 w-64 max-w-full" />
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            <Block className="h-4 w-28" />
            <Block className="h-4 w-36" />
            <Block className="h-4 w-32" />
          </div>
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            <Block className="h-11 w-40" />
            <Block className="h-11 w-40" />
          </div>
          <Block className="h-9 w-36" />
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2">
          <div>
            <Block className="mb-4 h-4 w-28" />
            <Block className="h-12 w-4/5" />
          </div>
          <div className="hidden lg:block" />
          <div className="space-y-3">
            <Block className="h-4 w-full" />
            <Block className="h-4 w-full" />
            <Block className="h-4 w-5/6" />
            <Block className="mt-4 h-4 w-full" />
            <Block className="h-4 w-2/3" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {slots("about", 4).map((id) => (
              <div key={id} className="rounded-xl border border-border/50 bg-card p-6">
                <Block className="mb-4 h-8 w-8 rounded-md" />
                <Block className="mb-2 h-5 w-20" />
                <Block className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col items-center">
            <Block className="mb-3 h-4 w-32" />
            <Block className="mb-4 h-12 w-72 max-w-full" />
            <Block className="h-4 w-full max-w-xl" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {slots("featured", 4).map((id) => (
              <CoverCard key={id} rounded="rounded-2xl" />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading />
          <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
            <div className="space-y-8">
              {slots("exp", 4).map((id) => (
                <div key={id} className="flex gap-4">
                  <Block className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="flex-1 rounded-lg border border-border/50 bg-card p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <Block className="h-5 w-2/3" />
                      <Block className="h-3 w-10" />
                    </div>
                    <Block className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="min-h-64 rounded-xl border border-border/50 bg-card p-6">
              <Block className="mb-4 h-8 w-1/2" />
              <Block className="mb-2 h-4 w-full" />
              <Block className="mb-2 h-4 w-full" />
              <Block className="mb-6 h-4 w-2/3" />
              <Block className="h-10 w-36" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading />
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div className="flex flex-col items-center gap-10 py-8">
              <Block className="h-28 w-28 rounded-xl" />
              <div className="flex w-full max-w-md justify-between gap-3">
                {slots("skill", 3).map((id) => (
                  <Block key={id} className="h-28 w-24 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/30 p-6">
              <Block className="mb-4 h-12 w-12 rounded-lg" />
              <Block className="h-4 w-48" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading />
          <Block className="mb-4 h-3 w-24" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {slots("tool", 8).map((id) => (
              <div key={id} className="rounded-xl border border-border/50 bg-card p-4">
                <Block className="mb-3 h-14 w-14 rounded-lg" />
                <Block className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading />
          <div className="mb-12 grid gap-6 sm:grid-cols-2">
            {slots("quest", 4).map((id) => (
              <div key={id} className="rounded-xl border border-border/50 bg-card p-6">
                <Block className="mb-3 h-12 w-12 rounded-lg" />
                <Block className="mb-3 h-6 w-40" />
                <Block className="mb-2 h-4 w-full" />
                <Block className="mb-4 h-4 w-5/6" />
                <Block className="mb-2 h-8 w-full" />
                <Block className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {slots("social", 4).map((id) => (
              <Block key={id} className="h-10 w-28 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function GamesGallerySkeleton() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {slots("game", 6).map((id) => (
            <li key={id}>
              <CoverCard />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function ProjectsGallerySkeleton() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading />
        <Block className="mb-4 h-10 w-full max-w-md" />
        <div className="mb-8 flex flex-wrap gap-2">
          {slots("filter", 6).map((id) => (
            <Block key={id} className="h-8 w-24" />
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {slots("project", 6).map((id) => (
            <CoverCard key={id} rounded="rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  )
}

export function GameDetailSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 pt-24 pb-20">
      <header className="flex flex-col gap-5">
        <Block className="h-4 w-44" />
        <Block className="h-12 w-full max-w-xl md:h-14" />
        <Block className="h-5 w-full max-w-2xl" />
        <div className="flex flex-wrap gap-2">
          <Block className="h-6 w-16 rounded-full" />
          <Block className="h-6 w-20 rounded-full" />
          <Block className="h-6 w-24 rounded-full" />
        </div>
      </header>

      <div className="relative aspect-video overflow-hidden rounded-xl border border-border/50">
        <Block className="h-full w-full rounded-none" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Spinner aria-hidden="true" role="presentation" className="size-8 text-muted-foreground" />
          <Block className="h-3 w-24" />
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <Block className="h-8 w-40" />
            <Block className="h-4 w-full" />
            <Block className="h-4 w-full" />
            <Block className="h-4 w-3/4" />
          </div>
          <div className="flex flex-col gap-4">
            <Block className="h-8 w-32" />
            <div className="grid gap-2 sm:grid-cols-2">
              {slots("control", 4).map((id) => (
                <div key={id} className="flex items-center justify-between gap-4 rounded-md border border-border bg-card px-4 py-3">
                  <Block className="h-6 w-14" />
                  <Block className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Block className="h-8 w-28" />
            <div className="grid gap-3 sm:grid-cols-2">
              {slots("shot", 2).map((id) => (
                <Block key={id} className="aspect-video w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <aside className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
            <Block className="h-6 w-32" />
            {slots("spec", 4).map((id) => (
              <div key={id} className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
                <Block className="h-3 w-16" />
                <Block className="h-4 w-24" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <Block className="h-6 w-36" />
            {slots("doc", 3).map((id) => (
              <Block key={id} className="h-12 w-full" />
            ))}
          </div>
        </aside>
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-12">
        <Block className="h-8 w-64" />
        {slots("review", 2).map((id) => (
          <div key={id} className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <Block className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Block className="mb-2 h-4 w-32" />
                <Block className="h-3 w-24" />
              </div>
            </div>
            <Block className="mb-2 h-4 w-full" />
            <Block className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProjectDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pt-8">
      <Block className="mb-8 h-4 w-40" />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-6">
        <Block className="h-5 w-28" />
        <div className="flex gap-2">
          <Block className="h-7 w-24 rounded-full" />
          <Block className="h-7 w-16 rounded-full" />
          <Block className="h-7 w-20 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-video overflow-hidden rounded-xl border border-border/50">
          <Block className="h-full w-full rounded-none" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner aria-hidden="true" role="presentation" className="size-8 text-muted-foreground" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Block className="h-12 w-4/5" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-3/4" />
          <div className="mt-4 flex flex-wrap gap-2">
            <Block className="h-8 w-24 rounded-md" />
            <Block className="h-8 w-28 rounded-md" />
          </div>
          <Block className="mt-4 h-11 w-40" />
        </div>
      </div>
    </div>
  )
}

export function BlogIndexSkeleton() {
  return (
    <>
      <section className="pt-24 pb-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 text-center">
          <Block className="mb-6 h-16 w-16 rounded-xl" />
          <Block className="mb-4 h-12 w-64 max-w-full" />
          <Block className="mb-3 h-4 w-full max-w-md" />
          <Block className="h-4 w-full max-w-sm" />
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            {slots("post", 3).map((id) => (
              <article key={id} className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex gap-2">
                  <Block className="h-6 w-24 rounded-full" />
                  <Block className="h-6 w-20 rounded-full" />
                </div>
                <Block className="mb-3 h-8 w-3/4" />
                <Block className="mb-2 h-4 w-full" />
                <Block className="mb-4 h-4 w-2/3" />
                <div className="flex items-center gap-3">
                  <Block className="h-8 w-8 rounded-full" />
                  <Block className="h-4 w-32" />
                </div>
              </article>
            ))}
          </div>
          <aside className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-4">
              <Block className="mb-3 h-4 w-20" />
              <Block className="h-10 w-full" />
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <Block className="mb-3 h-4 w-24" />
              <div className="space-y-2">
                {slots("cat", 4).map((id) => (
                  <Block key={id} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}

export function BlogPostSkeleton() {
  return (
    <>
      <section className="bg-muted/30 pt-24 pb-12">
        <div className="mx-auto max-w-4xl px-4">
          <Block className="mb-8 h-4 w-32" />
          <Block className="mb-4 h-6 w-24 rounded-full" />
          <Block className="mb-3 h-12 w-full" />
          <Block className="mb-6 h-12 w-3/4" />
          <Block className="mb-2 h-5 w-full" />
          <Block className="mb-6 h-5 w-2/3" />
          <div className="flex items-center gap-6">
            <Block className="h-12 w-12 rounded-full" />
            <div>
              <Block className="mb-2 h-4 w-32" />
              <Block className="h-3 w-24" />
            </div>
            <Block className="h-4 w-28" />
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-4xl space-y-4 px-4">
          <Block className="h-8 w-1/2" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-3/4" />
          <Block className="my-6 h-48 w-full rounded-lg" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-2/3" />
        </div>
      </section>
    </>
  )
}

export function EditorFormSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-20">
      <Block className="mb-3 h-3 w-48" />
      <Block className="mb-3 h-10 w-72 max-w-full" />
      <Block className="mb-10 h-4 w-full max-w-xl" />
      <div className="grid gap-8">
        <Block className="aspect-video w-full max-w-xl rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          {slots("field", 4).map((id) => (
            <div key={id} className="flex flex-col gap-2">
              <Block className="h-3 w-24" />
              <Block className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Block className="h-3 w-28" />
          <Block className="h-32 w-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          {slots("tag", 5).map((id) => (
            <Block key={id} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Block className="h-10 w-36" />
      </div>
    </div>
  )
}

export function BlogEditorSkeleton() {
  return (
    <div className="min-h-screen bg-background" aria-hidden="true">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <Block className="h-4 w-28" />
          <Block className="ml-auto h-4 w-32" />
          <Block className="h-8 w-28" />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Block className="mb-6 h-10 w-56" />
        <Block className="mb-4 h-12 w-full" />
        <Block className="mb-8 h-20 w-full" />
        <div className="space-y-4">
          <Block className="h-6 w-2/3" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-full" />
          <Block className="h-40 w-full rounded-lg" />
          <Block className="h-4 w-5/6" />
        </div>
      </main>
    </div>
  )
}

export function ContentEditorSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-24 pb-16">
      <Block className="mb-3 h-3 w-40" />
      <Block className="mb-3 h-10 w-64" />
      <Block className="mb-8 h-4 w-full max-w-xl" />
      <div className="mb-8 flex flex-wrap gap-2 border-b border-border/50 pb-4">
        {slots("section", 5).map((id) => (
          <Block key={id} className="h-8 w-24" />
        ))}
      </div>
      <div className="flex flex-col gap-5">
        {slots("copy", 4).map((id) => (
          <div key={id} className="flex flex-col gap-2">
            <Block className="h-3 w-28" />
            <Block className="h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
