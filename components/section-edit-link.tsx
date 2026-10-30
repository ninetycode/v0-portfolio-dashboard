"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdmin } from "@/lib/admin-context"

export function SectionEditLink({ seccion }: { seccion: string }) {
  const { isAdmin } = useAdmin()
  if (!isAdmin) return null

  return (
    <Button asChild size="sm" variant="outline" className="ml-auto gap-2 border-primary/30 font-mono text-xs">
      <Link href={`/contenido?seccion=${seccion}`}>
        <Pencil className="h-3.5 w-3.5" />
        editar
      </Link>
    </Button>
  )
}
