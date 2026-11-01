import type { Metadata } from "next"
import Link from "next/link"
import { AdminLoginPanel } from "@/components/contactos/admin-login"
import { ContactLinksForm } from "@/components/contactos/contact-editor"
import { Toaster } from "@/components/ui/sonner"
import { isAdmin } from "@/lib/admin-auth"
import { readContactLinks } from "@/lib/site-content/contact-links-store"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Editar enlaces | Mathías Andino",
  robots: { index: false, follow: false },
}

const navClass =
  "rounded-md border border-border/70 px-2.5 py-1 font-mono text-xs text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export default async function ContactEditorPage() {
  if (!(await isAdmin())) {
    return (
      <main className="min-h-[100dvh] bg-background">
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 py-10">
          <AdminLoginPanel title="Editar enlaces" description="Entrá para cambiar los botones de contacto." />
        </div>
      </main>
    )
  }

  const data = await readContactLinks()

  return (
    <main className="min-h-[100dvh] bg-background">
      <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-8">
        <Toaster position="top-center" />
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-primary">contactos / editor</p>
            <h1 className="mt-2 font-serif text-3xl font-bold">Editar enlaces</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/contactos" className={navClass}>
              Ver página
            </Link>
            <Link href="/contactos/stats" className={navClass}>
              Estadísticas
            </Link>
          </div>
        </div>
        <ContactLinksForm initial={data} />
      </div>
    </main>
  )
}
