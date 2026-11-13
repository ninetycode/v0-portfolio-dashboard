"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Home } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"

export function NotFoundContent() {
  useEffect(() => {
    document.documentElement.dataset.notFound = "true"
    window.dispatchEvent(new Event("not-found-change"))
    return () => {
      delete document.documentElement.dataset.notFound
      window.dispatchEvent(new Event("not-found-change"))
    }
  }, [])

  return (
    <main
      data-not-found-page=""
      className="flex min-h-[100dvh] w-full items-center justify-center bg-background px-6 py-12 text-foreground"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-10 md:flex-row md:items-center md:justify-between md:gap-12 lg:gap-16">
        {/* Texto a la izquierda */}
        <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
          <span className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Error 404
          </span>

          <h1 className="font-serif text-6xl font-bold tracking-tight text-foreground sm:text-7xl lg:text-8xl">
            ¡Uy!
          </h1>

          <p className="mt-5 max-w-md text-balance text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            Parece que esta página no existe o dejó de existir. Pero aún podés seguir viendo{" "}
            <Link
              href="/games"
              className="font-medium text-foreground underline decoration-primary/60 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              mis juegos
            </Link>{" "}
            ;)
          </p>

          <div className="mt-8">
            <Button
              asChild
              size="lg"
              className="h-12 gap-2.5 rounded-xl bg-primary px-7 font-sans text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-highlight hover:text-highlight-foreground hover:shadow-xl hover:shadow-highlight/40"
            >
              <Link href="/">
                <Home className="size-4" aria-hidden="true" />
                Ir al inicio
              </Link>
            </Button>
          </div>
        </div>

        {/* Barra separadora en el medio */}
        <div
          aria-hidden="true"
          className="h-0.5 w-28 shrink-0 rounded-full bg-primary/30 md:h-60 md:w-0.5 lg:h-72"
        />

        {/* Logo a la derecha */}
        <div className="flex flex-1 items-center justify-center">
          <BrandLogo
            aria-label="Logo de Mathías Andino"
            aria-hidden={false}
            role="img"
            className="h-auto w-44 text-primary animate-float motion-reduce:animate-none sm:w-56 md:w-64 lg:w-80"
          />
        </div>
      </div>
    </main>
  )
}
