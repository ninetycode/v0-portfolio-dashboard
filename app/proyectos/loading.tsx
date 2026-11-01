import { ProjectsGallerySkeleton, SiteLoading } from "@/components/loading/skeletons"

export default function ProjectsLoading() {
  return (
    <SiteLoading label="Cargando la galería de proyectos.">
      <ProjectsGallerySkeleton />
    </SiteLoading>
  )
}
