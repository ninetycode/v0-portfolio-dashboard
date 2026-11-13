import type { Metadata } from "next"
import { NotFoundContent } from "@/components/not-found-content"
import { siteConfig } from "@/lib/site-config"

export const metadata: Metadata = {
  title: `404 | Página no encontrada | ${siteConfig.name}`,
  description: "Parece que esta página no existe o dejó de existir.",
}

export default function NotFound() {
  return <NotFoundContent />
}
