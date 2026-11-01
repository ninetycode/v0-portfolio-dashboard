import { EditorFormSkeleton, SiteLoading } from "@/components/loading/skeletons"

export default function EditProjectEditorLoading() {
  return (
    <SiteLoading label="Cargando el formulario para editar el proyecto." variant="bare">
      <EditorFormSkeleton />
    </SiteLoading>
  )
}
