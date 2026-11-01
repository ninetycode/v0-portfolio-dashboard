import { EditorFormSkeleton, SiteLoading } from "@/components/loading/skeletons"

export default function NewProjectEditorLoading() {
  return (
    <SiteLoading label="Cargando el formulario para agregar un proyecto." variant="bare">
      <EditorFormSkeleton />
    </SiteLoading>
  )
}
