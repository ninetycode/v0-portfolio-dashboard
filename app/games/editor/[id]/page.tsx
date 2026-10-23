import { redirect, notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { StatusBar } from "@/components/status-bar"
import { GameEditorForm } from "@/components/games/game-editor-form"
import { getGameById } from "@/app/actions/games"
import { isAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/games")
  const { id } = await params
  const game = await getGameById(id)
  if (!game) notFound()
  return <div className="min-h-screen bg-background"><Navbar /><main className="mx-auto max-w-5xl px-4 pt-28 pb-20"><div className="mb-10"><p className="font-mono text-xs uppercase tracking-widest text-primary">modo_admin / editar contenido</p><h1 className="mt-3 font-serif text-4xl font-bold">Editar {game.title}</h1><p className="mt-3 text-muted-foreground">Actualiza descripción, controles, ficha técnica, capturas y documentación.</p></div><GameEditorForm game={game} /></main><Footer /><StatusBar /></div>
}
