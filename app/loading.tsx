import { HomeSkeleton, SiteLoading } from "@/components/loading/skeletons"

export default function HomeLoading() {
  return (
    <SiteLoading label="Cargando el inicio: presentación, sobre mí, juegos, experiencia, habilidades, herramientas y contacto." variant="home">
      <HomeSkeleton />
    </SiteLoading>
  )
}
