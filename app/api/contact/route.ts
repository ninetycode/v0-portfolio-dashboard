import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

export const runtime = "nodejs"

const OWNER_EMAIL = "mathias.gamedesigner@gmail.com"

type Payload = {
  name?: unknown
  email?: unknown
  message?: unknown
  questTitle?: unknown
  questKind?: unknown
  website?: unknown
}

let ensuring: Promise<void> | null = null

function ensureTable(): Promise<void> {
  if (!ensuring) {
    ensuring = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          quest_title text NOT NULL,
          quest_kind text,
          name text NOT NULL,
          email text NOT NULL,
          message text NOT NULL,
          emailed boolean NOT NULL DEFAULT false,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `)
    })().catch((error: unknown) => {
      ensuring = null
      throw error
    })
  }
  return ensuring
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

async function sendEmail(input: {
  quest: string
  name: string
  email: string
  message: string
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const domain = process.env.RESEND_EMAIL_DOMAIN
  if (!apiKey || !domain) {
    console.error("[contact] falta RESEND_API_KEY o RESEND_EMAIL_DOMAIN")
    return false
  }

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="margin:0 0 4px">Nueva misión aceptada</h2>
      <p style="margin:0 0 16px;color:#555">${escapeHtml(input.quest)}</p>
      <p><strong>Nombre:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(input.email)}">${escapeHtml(input.email)}</a></p>
      <p><strong>Mensaje:</strong></p>
      <p style="white-space:pre-wrap;background:#f4f4f5;padding:12px;border-radius:8px">${escapeHtml(input.message)}</p>
      <p style="color:#888;font-size:12px">Podés responder directamente a este correo.</p>
    </div>`

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Tablero de misiones <contacto@${domain}>`,
      to: [OWNER_EMAIL],
      reply_to: input.email,
      subject: `[Misión] ${input.quest} - ${input.name}`,
      html,
      text: `Misión: ${input.quest}\nNombre: ${input.name}\nEmail: ${input.email}\n\n${input.message}`,
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    console.error("[contact] Resend respondió", res.status, detail.slice(0, 300))
    return false
  }
  return true
}

export async function POST(request: Request) {
  let body: Payload
  try {
    body = (await request.json()) as Payload
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 })
  }

  // Campo trampa para bots: los humanos nunca lo ven ni lo completan.
  if (clean(body.website, 200)) return NextResponse.json({ ok: true })

  const name = clean(body.name, 120)
  const email = clean(body.email, 200)
  const message = clean(body.message, 4000)
  const quest = clean(body.questTitle, 200) || "Misión"
  const kind = clean(body.questKind, 40) || null

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 })
  }

  let emailed = false
  try {
    emailed = await sendEmail({ quest, name, email, message })
  } catch (error) {
    console.error("[contact] error enviando email", error)
  }

  let saved = false
  if (process.env.DATABASE_URL) {
    try {
      await ensureTable()
      await pool.query(
        `INSERT INTO contact_messages (quest_title, quest_kind, name, email, message, emailed)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [quest, kind, name, email, message, emailed],
      )
      saved = true
    } catch (error) {
      console.error("[contact] error guardando en la base de datos", error)
    }
  }

  if (!emailed && !saved) {
    return NextResponse.json({ ok: false, error: "delivery" }, { status: 502 })
  }
  return NextResponse.json({ ok: true, emailed })
}
