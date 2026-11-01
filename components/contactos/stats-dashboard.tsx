"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { ContactLink } from "@/lib/site-content/contact-links"
import type { LinkClickMetrics } from "@/lib/db/link-clicks"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const clickTime = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

const navClass =
  "rounded-md border border-border/70 px-2.5 py-1 font-mono text-xs text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function StatsDashboard({ links, metrics }: { links: ContactLink[]; metrics: LinkClickMetrics }) {
  const [ready, setReady] = useState(false)
  const titles = new Map(links.map((link) => [link.slug, link.title]))
  const topTitle = metrics.topSlug ? titles.get(metrics.topSlug) ?? metrics.topSlug : null
  const measured = metrics.mobile + metrics.desktop
  const mobilePct = measured === 0 ? 0 : Math.round((metrics.mobile / measured) * 100)
  const desktopPct = measured === 0 ? 0 : 100 - mobilePct
  const known = new Set(links.map((link) => link.slug))
  const rows = [
    ...links.map((link) => ({
      slug: link.slug,
      title: link.title,
      count: metrics.bySlug.find((item) => item.slug === link.slug)?.count ?? 0,
      active: link.active,
    })),
    ...metrics.bySlug
      .filter((item) => !known.has(item.slug))
      .map((item) => ({ slug: item.slug, title: item.slug, count: item.count, active: false })),
  ].toSorted((a, b) => b.count - a.count || a.title.localeCompare(b.title, "es"))
  const max = rows.reduce((peak, row) => Math.max(peak, row.count), 0)

  useEffect(() => {
    setReady(true)
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-primary">contactos / estadísticas</p>
          <h1 className="mt-2 font-serif text-3xl font-bold">Clics</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/contactos" className={navClass}>
            Volver a contactos
          </Link>
          <Link href="/contactos/editor" className={navClass}>
            Editar enlaces
          </Link>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Resumen">
        <Kpi label="Clics totales" value={String(metrics.total)} />
        <Kpi label="Últimos 7 días" value={String(metrics.last7Days)} />
        <Kpi label="Enlace más visitado" value={topTitle ?? "Sin clics"} detail={topTitle ? `${metrics.topCount} clics` : undefined} />
        <Kpi
          label="Móvil / escritorio"
          value={metrics.total === 0 ? "Sin clics" : `${mobilePct}% móvil`}
          detail={metrics.total === 0 ? undefined : `${desktopPct}% escritorio`}
        />
      </section>

      <section className="rounded-xl border border-border/70 p-4">
        <h2 className="font-serif text-xl font-semibold">Clics por día</h2>
        <p className="mt-1 text-sm text-muted-foreground">Últimos 14 días, horario de Buenos Aires.</p>
        <div className="mt-4 h-56">
          {ready ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.byDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} minTickGap={24} />
                <YAxis allowDecimals={false} width={32} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Clics" fill="var(--primary)" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
        <table className="sr-only">
          <caption>Clics por día</caption>
          <tbody>
            {metrics.byDay.map((day) => (
              <tr key={day.day}>
                <th scope="row">{day.label}</th>
                <td>{day.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold">Por botón</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {rows.length === 0 ? <li className="text-sm text-muted-foreground">Todavía no hay clics.</li> : null}
          {rows.map((row) => (
            <li key={row.slug} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">
                  {row.title}
                  {row.active ? null : <span className="ml-2 font-mono text-xs text-muted-foreground">oculto</span>}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{row.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${max === 0 ? 0 : (row.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold">Últimos eventos</h2>
        {metrics.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay clics.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cuándo</TableHead>
                <TableHead>Enlace</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Origen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.recent.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="whitespace-normal">{clickTime.format(new Date(event.createdAt))}</TableCell>
                  <TableCell className="whitespace-normal">{titles.get(event.slug) ?? event.slug}</TableCell>
                  <TableCell>{event.deviceType === "mobile" ? "Móvil" : "Escritorio"}</TableCell>
                  <TableCell>{event.country ?? "—"}</TableCell>
                  <TableCell className="whitespace-normal">{referrerLabel(event.referrer)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}

function Kpi({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card px-4 py-4">
      <p className="font-mono text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-2xl font-semibold text-balance">{value}</p>
      {detail ? <p className="mt-1 text-sm text-muted-foreground">{detail}</p> : null}
    </div>
  )
}

function referrerLabel(value: string | null): string {
  if (!value) return "Directo"
  try {
    return new URL(value).host
  } catch {
    return value.slice(0, 48)
  }
}
