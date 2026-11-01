import type { Metadata } from "next"
import { Suspense } from "react"
import { ContactPage } from "@/components/contactos/contact-page"
import ContactosLoading from "./loading"
import { isAdmin } from "@/lib/admin-auth"
import { contactProfileSchema, visibleContactLinks } from "@/lib/site-content/contact-links"
import { readContactLinks } from "@/lib/site-content/contact-links-store"
import { siteBaseUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const data = await readContactLinks()
  const base = siteBaseUrl()
  const description =
    data.header.bio || `Links de ${data.header.displayName}: portfolio, juegos, proyectos, blog y redes.`
  const title = `Contacto | ${data.header.displayName}`

  return {
    title,
    description,
    alternates: { canonical: `${base}/contactos` },
    openGraph: {
      title,
      description,
      url: `${base}/contactos`,
      siteName: data.header.displayName,
      type: "profile",
      locale: "es_AR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default function ContactosPage() {
  return (
    <Suspense fallback={<ContactosLoading />}>
      <ContactosContent />
    </Suspense>
  )
}

async function ContactosContent() {
  const [content, admin] = await Promise.all([readContactLinks(), isAdmin()])
  const visible = visibleContactLinks(content)
  const data = admin ? content : { ...content, links: visible }
  const schema = contactProfileSchema({ ...content, links: visible })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <ContactPage data={data} canEdit={admin} />
    </>
  )
}
