import { readFile } from "node:fs/promises"
import { join, sep } from "node:path"
import { createElement } from "react"
import { ImageResponse } from "next/og"
import sharp from "sharp"
import { readContactLinks } from "@/lib/site-content/contact-links-store"

export const ogSize = { width: 1200, height: 630 }

async function avatarDataUrl(url: string): Promise<string | null> {
  if (!url.startsWith("/") || url.includes("..") || url.includes("\\")) return null
  const relative = url.replace(/^\/+/, "")
  const root = join(process.cwd(), "public")
  const filePath = join(root, relative)
  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) return null
  try {
    const file = await readFile(filePath)
    // public/profile-avatar.jpg is a PNG despite the extension. Satori only
    // decodes the declared data-URL type, so always re-encode a small PNG.
    const png = await sharp(file).resize(256, 256, { fit: "cover" }).png().toBuffer()
    return `data:image/png;base64,${png.toString("base64")}`
  } catch {
    return null
  }
}

export async function renderContactOg() {
  const data = await readContactLinks()
  const avatar = await avatarDataUrl(data.header.avatarUrl)
  const name = data.header.displayName.slice(0, 42) || "Mathías Andino"
  const role = (data.header.roleBadge || "Game Narrative Designer").slice(0, 70)
  const bioSource = data.header.bio || "Portfolio, juegos, proyectos y redes."
  const bio = bioSource.length > 160 ? `${bioSource.slice(0, 157)}…` : bioSource

  const portrait = avatar
    ? createElement("img", {
        src: avatar,
        width: 128,
        height: 128,
        style: { borderRadius: 64, objectFit: "cover" },
      })
    : createElement("div", {
        style: { width: 128, height: 128, borderRadius: 64, background: "#3a3158" },
      })

  return new ImageResponse(
    createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#241b36",
          color: "#f4f1fb",
        },
      },
      createElement("div", { style: { width: 18, height: "100%", background: "#b6e3a8" } }),
      createElement(
        "div",
        {
          style: {
            display: "flex",
            width: 1182,
            height: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
          },
        },
        createElement("div", { style: { display: "flex", fontSize: 22, color: "#b6e3a8" } }, "mathiasandino.ar"),
        createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 32 } },
          portrait,
          createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", maxWidth: 820 } },
            createElement("div", { style: { fontSize: 68, fontWeight: 700, lineHeight: 1.05 } }, name),
            createElement("div", { style: { marginTop: 16, fontSize: 26, color: "#b6e3a8" } }, role),
          ),
        ),
        createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 18 } },
          createElement("div", { style: { fontSize: 28, lineHeight: 1.35, color: "#d9d3e6", maxWidth: 900 } }, bio),
          createElement("div", { style: { fontSize: 22, color: "#b6e3a8" } }, "/contactos"),
        ),
      ),
    ),
    ogSize,
  )
}
