import { BlogPostSkeleton, SiteLoading } from "@/components/loading/skeletons"

export default function BlogPostLoading() {
  return (
    <SiteLoading label="Cargando la entrada del blog." variant="bare">
      <BlogPostSkeleton />
    </SiteLoading>
  )
}
