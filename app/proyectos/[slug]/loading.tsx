import { ProjectDetailSkeleton, SiteLoading } from "@/components/loading/skeletons"

export default function ProjectDetailLoading() {
  return (
    <SiteLoading label="Cargando el proyecto: imagen, estado y descripción." variant="bare">
      <div className="pt-20">
        <ProjectDetailSkeleton />
      </div>
    </SiteLoading>
  )
}
