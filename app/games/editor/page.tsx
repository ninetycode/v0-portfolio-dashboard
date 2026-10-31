import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GameEditorForm } from "@/components/games/game-editor-form"
import { isAdmin } from "@/lib/admin-auth"
import { getGameTaxonomy } from "@/app/actions/games"

export const dynamic = "force-dynamic"

export default async function NewGamePage() {
  if (!(await isAdmin())) redirect("/games")
  const taxonomy = await getGameTaxonomy()
  return <div className="min-h-screen bg-background"><Navbar /><main className="mx-auto max-w-5xl px-4 pt-28 pb-20"><div className="mb-10"><p className="font-mono text-xs uppercase tracking-widest text-primary">modo_admin / nuevo juego</p><h1 className="mt-3 font-serif text-4xl font-bold">Agregar juego</h1><p className="mt-3 text-muted-foreground">Importa la ficha desde itch.io o rellénala a mano. Puedes editar todo después.</p></div><GameEditorForm taxonomy={taxonomy} /></main><Footer /></div>
}
