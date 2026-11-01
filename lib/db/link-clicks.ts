import { db, pool } from "@/lib/db"
import { linkClicks } from "@/lib/db/schema"

export type LinkClickInput = {
  slug: string
  referrer: string | null
  userAgent: string | null
  deviceType: string | null
  country: string | null
}

export type LinkClickEvent = {
  id: string
  slug: string
  referrer: string | null
  deviceType: string | null
  country: string | null
  createdAt: string
}

export type LinkClickMetrics = {
  total: number
  last7Days: number
  topSlug: string | null
  topCount: number
  mobile: number
  desktop: number
  bySlug: { slug: string; count: number }[]
  byDay: { day: string; label: string; count: number }[]
  recent: LinkClickEvent[]
}

const BUENOS_AIRES = "America/Argentina/Buenos_Aires"

let ensuring: Promise<void> | null = null

export function detectDeviceType(userAgent: string | null): "mobile" | "desktop" {
  if (!userAgent) return "desktop"
  return /Mobi|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ? "mobile" : "desktop"
}

function ensureLinkClicksTable(): Promise<void> {
  if (!ensuring) {
    ensuring = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS link_clicks (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          slug text NOT NULL,
          referrer text,
          user_agent text,
          device_type text,
          country text,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `)
      await pool.query(`CREATE INDEX IF NOT EXISTS link_clicks_created_at_idx ON link_clicks (created_at DESC)`)
      await pool.query(`CREATE INDEX IF NOT EXISTS link_clicks_slug_idx ON link_clicks (slug)`)
    })().catch((error: unknown) => {
      ensuring = null
      throw error
    })
  }
  return ensuring
}

function emptyMetrics(): LinkClickMetrics {
  return {
    total: 0,
    last7Days: 0,
    topSlug: null,
    topCount: 0,
    mobile: 0,
    desktop: 0,
    bySlug: [],
    byDay: calendarDays(14).map((day) => ({ day, label: labelForDay(day), count: 0 })),
    recent: [],
  }
}

function asCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function asIso(value: unknown): string {
  const date = value instanceof Date ? value : new Date(typeof value === "string" ? value : "")
  return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString()
}

function calendarDays(count: number): string[] {
  const format = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUENOS_AIRES,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const days: string[] = []
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    days.push(format.format(new Date(Date.now() - offset * 24 * 60 * 60 * 1000)))
  }
  return days
}

function labelForDay(day: string): string {
  const [year, month, date] = day.split("-").map(Number)
  if (!year || !month || !date) return day
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, date)))
}

function cleanCountry(value: string | null): string | null {
  if (!value) return null
  const code = value.trim().toUpperCase()
  return /^[A-Z]{2}$/.test(code) ? code : null
}

export async function recordLinkClick(input: LinkClickInput): Promise<void> {
  if (!process.env.DATABASE_URL) return
  await ensureLinkClicksTable()
  const device = input.deviceType === "mobile" || input.deviceType === "desktop" ? input.deviceType : null
  await db.insert(linkClicks).values({
    slug: input.slug.slice(0, 80),
    referrer: input.referrer?.slice(0, 500) || null,
    userAgent: input.userAgent?.slice(0, 500) || null,
    deviceType: device,
    country: cleanCountry(input.country),
  })
}

export async function getLinkClickMetrics(): Promise<LinkClickMetrics> {
  if (!process.env.DATABASE_URL) return emptyMetrics()
  try {
    await ensureLinkClicksTable()
    const [totalRes, weekRes, slugRes, deviceRes, dayRes, recentRes] = await Promise.all([
      pool.query<{ count: number }>(`SELECT count(*)::int AS count FROM link_clicks`),
      pool.query<{ count: number }>(
        `SELECT count(*)::int AS count FROM link_clicks WHERE created_at >= now() - interval '7 days'`,
      ),
      pool.query<{ slug: string; count: number }>(
        `SELECT slug, count(*)::int AS count FROM link_clicks GROUP BY slug ORDER BY count DESC LIMIT 50`,
      ),
      pool.query<{ device_type: string; count: number }>(
        `SELECT coalesce(nullif(device_type, ''), 'desktop') AS device_type, count(*)::int AS count FROM link_clicks GROUP BY 1`,
      ),
      pool.query<{ day: string; count: number }>(
        `SELECT to_char(created_at AT TIME ZONE 'America/Argentina/Buenos_Aires', 'YYYY-MM-DD') AS day,
                count(*)::int AS count
         FROM link_clicks
         WHERE created_at >= now() - interval '16 days'
         GROUP BY 1
         ORDER BY 1`,
      ),
      pool.query<{
        id: string
        slug: string
        referrer: string | null
        device_type: string | null
        country: string | null
        created_at: Date | string
      }>(
        `SELECT id, slug, referrer, device_type, country, created_at
         FROM link_clicks
         ORDER BY created_at DESC
         LIMIT 20`,
      ),
    ])

    let mobile = 0
    let desktop = 0
    for (const row of deviceRes.rows) {
      const count = asCount(row.count)
      if (row.device_type === "mobile") mobile += count
      else desktop += count
    }

    const bySlug = slugRes.rows.map((row) => ({ slug: row.slug, count: asCount(row.count) }))
    const dayCounts = new Map(dayRes.rows.map((row) => [row.day, asCount(row.count)]))
    const top = bySlug[0]

    return {
      total: asCount(totalRes.rows[0]?.count),
      last7Days: asCount(weekRes.rows[0]?.count),
      topSlug: top?.slug ?? null,
      topCount: top?.count ?? 0,
      mobile,
      desktop,
      bySlug,
      byDay: calendarDays(14).map((day) => ({
        day,
        label: labelForDay(day),
        count: dayCounts.get(day) ?? 0,
      })),
      recent: recentRes.rows.map((row) => ({
        id: String(row.id),
        slug: row.slug,
        referrer: row.referrer,
        deviceType: row.device_type,
        country: row.country,
        createdAt: asIso(row.created_at),
      })),
    }
  } catch {
    console.error("[link-clicks] no se pudieron leer las métricas")
    return emptyMetrics()
  }
}
