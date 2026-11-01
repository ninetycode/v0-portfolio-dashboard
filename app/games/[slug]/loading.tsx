import { GameDetailSkeleton, SiteLoading } from "@/components/loading/skeletons"

export default function GameDetailLoading() {
  return (
    <SiteLoading label="Cargando la ficha del juego: portada, descripción, controles y valoraciones." variant="bare">
      <GameDetailSkeleton />
    </SiteLoading>
  )
}
