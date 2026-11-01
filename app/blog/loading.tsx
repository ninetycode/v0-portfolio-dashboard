import { BlogIndexSkeleton, SiteLoading } from "@/components/loading/skeletons"

export default function BlogLoading() {
  return (
    <SiteLoading label="Cargando el blog: entradas y filtros." variant="bare">
      <BlogIndexSkeleton />
    </SiteLoading>
  )
}
