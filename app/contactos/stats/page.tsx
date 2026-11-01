import type { Metadata } from "next"
import { AdminLoginPanel } from "@/components/contactos/admin-login"
import { StatsDashboard } from "@/components/contactos/stats-dashboard"
import { isAdmin } from "@/lib/admin-auth"
import { readContactLinks } from "@/lib/site-content/contact-links-store"
import { getLinkClickMetrics } from "@/lib/db/link-clicks"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Estadísticas | Contacto",
  robots: { index: false, follow: false },
}

export default async function ContactStatsPage() {
  if (!(await isAdmin())) {
    return (
      <main className="min-h-[100dvh] bg-background">
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 py-10">
          <AdminLoginPanel title="Estadísticas" description="Entrá para ver los clics de los enlaces." />
        </div>
      </main>
    )
  }

  const [content, metrics] = await Promise.all([readContactLinks(), getLinkClickMetrics()])

  return (
    <main className="min-h-[100dvh] bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <StatsDashboard links={content.links} metrics={metrics} />
      </div>
    </main>
  )
}
