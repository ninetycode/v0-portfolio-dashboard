import { EditorFormSkeleton, SiteLoading } from "@/components/loading/skeletons"

export default function EditGameEditorLoading() {
  return (
    <SiteLoading label="Cargando el formulario para editar el juego." variant="bare">
      <EditorFormSkeleton />
    </SiteLoading>
  )
}
