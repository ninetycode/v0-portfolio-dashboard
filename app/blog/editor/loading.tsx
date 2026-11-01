import { BlogEditorSkeleton } from "@/components/loading/skeletons"

export default function NewPostEditorLoading() {
  return (
    <>
      <div role="status" aria-live="polite" aria-busy="true" className="sr-only">
        Cargando el editor de la entrada.
      </div>
      <BlogEditorSkeleton />
    </>
  )
}
