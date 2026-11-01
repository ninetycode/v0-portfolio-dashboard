import { GamesGallerySkeleton, SiteLoading } from "@/components/loading/skeletons"

export default function GamesLoading() {
  return (
    <SiteLoading label="Cargando la galería de videojuegos.">
      <GamesGallerySkeleton />
    </SiteLoading>
  )
}
