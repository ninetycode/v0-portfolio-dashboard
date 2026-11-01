import { ContentEditorSkeleton, SiteLoading } from "@/components/loading/skeletons"

export default function ContentEditorLoading() {
  return (
    <SiteLoading label="Cargando el editor de textos." variant="bare">
      <ContentEditorSkeleton />
    </SiteLoading>
  )
}
