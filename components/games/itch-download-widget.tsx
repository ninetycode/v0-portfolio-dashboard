import { Download } from "lucide-react"

type Props = { itchGameId: string; title: string; platforms: string[]; coverImage: string | null }

export function ItchDownloadWidget({ itchGameId, title, platforms, coverImage }: Props) {
  const src = `https://itch.io/embed/${itchGameId}?linkback=true&dark=true&border_width=0`
  return (
    <section aria-label="Descargar" className="flex w-fit max-w-full flex-col gap-4 self-start rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-primary">
          <Download className="h-4 w-4" aria-hidden />
          Descargar
        </h2>
        {platforms.length > 0 && (
          <p className="font-mono text-xs text-muted-foreground">{platforms.join(" · ")}</p>
        )}
      </div>
      <iframe
        src={src}
        title={`Descargar ${title} desde itch.io`}
        width={552}
        height={167}
        loading="lazy"
        className="h-[167px] w-full max-w-[552px] rounded-md border-0"
      />
      {coverImage && (
        <img
          src={coverImage}
          alt={`Portada de ${title}`}
          loading="lazy"
          className="h-auto w-full max-w-[552px] rounded-md object-cover"
        />
      )}
    </section>
  )
}
