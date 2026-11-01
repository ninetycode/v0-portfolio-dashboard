"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { adminLogin } from "@/app/actions/admin"
import { useAdmin } from "@/lib/admin-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AdminLoginPanel({ title, description }: { title: string; description: string }) {
  const router = useRouter()
  const { setIsAdmin } = useAdmin()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")
    try {
      const result = await adminLogin(password)
      if (!result.success) {
        setError(result.error || "No se pudo entrar.")
        return
      }
      setPassword("")
      setIsAdmin(true)
      router.refresh()
    } catch {
      setError("No se pudo entrar.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <p className="font-mono text-xs text-primary">contactos</p>
      <h1 className="mt-3 font-serif text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="admin-password">Contraseña</Label>
          <Input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </Button>
      </form>
      <Link href="/contacto" className="mt-6 font-mono text-xs text-primary hover:underline">
        Volver a contactos
      </Link>
    </div>
  )
}
