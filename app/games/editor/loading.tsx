import { EditorFormSkeleton, SiteLoading } from "@/components/loading/skeletons"

export default function NewGameEditorLoading() {
  return (
    <SiteLoading label="Cargando el formulario para agregar un juego." variant="bare">
      <EditorFormSkeleton />
    </SiteLoading>
  )
}
