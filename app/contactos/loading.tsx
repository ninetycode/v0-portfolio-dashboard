const rows = ["a", "b", "c", "d", "e", "f"]

export default function ContactosLoading() {
  return (
    <main className="min-h-[100dvh] bg-background">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center px-4 py-10">
        <div className="h-24 w-24 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />
        <div className="mt-4 h-7 w-48 animate-pulse rounded bg-accent motion-reduce:animate-none" />
        <div className="mt-3 h-4 w-64 max-w-full animate-pulse rounded bg-accent motion-reduce:animate-none" />
        <div className="mt-8 flex w-full flex-col gap-3">
          {rows.map((row) => (
            <div key={row} className="h-14 w-full animate-pulse rounded-xl bg-accent motion-reduce:animate-none" />
          ))}
        </div>
      </div>
    </main>
  )
}
