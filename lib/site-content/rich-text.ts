export type FontName = "serif" | "sans" | "mono"

export type RichNode =
  | { t: "text"; v: string }
  | { t: "br" }
  | { t: "strong" | "em" | "u"; c: RichNode[] }
  | { t: "span"; color?: string; font?: FontName; c: RichNode[] }
  | { t: "ul"; items: RichNode[][] }
  | { t: "img"; src: string; alt: string }

const BLOCKS = new Set(["div", "p", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "section", "article", "header", "footer", "tr"])

type Mark = { bold?: boolean; italic?: boolean; under?: boolean; color?: string; font?: FontName }

type Frame =
  | { kind: "block"; tag: string; nodes: RichNode[] }
  | { kind: "inline"; tag: string; nodes: RichNode[]; mark: Mark }
  | { kind: "skip"; tag: string; nodes: RichNode[] }
  | { kind: "ul"; tag: string; items: RichNode[][] }
  | { kind: "li"; tag: string; nodes: RichNode[] }

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-fA-F]+|#\d+|nbsp|amp|lt|gt|quot|apos);/g, (all, ent: string) => {
    if (ent === "nbsp") return " "
    if (ent === "amp") return "&"
    if (ent === "lt") return "<"
    if (ent === "gt") return ">"
    if (ent === "quot") return '"'
    if (ent === "apos") return "'"
    const code = ent.startsWith("#x") ? Number.parseInt(ent.slice(2), 16) : Number(ent.slice(1))
    if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return all
    return String.fromCodePoint(code)
  })
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/"/g, "&quot;")
}

function toHex(raw: string): string | undefined {
  const value = raw.trim().toLowerCase()
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(value)
  if (hex) {
    const h = hex[1]
    if (h.length === 3) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
    return `#${h}`
  }
  const rgb = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i.exec(value)
  if (!rgb) return
  return `#${[rgb[1], rgb[2], rgb[3]]
    .map((part) => Math.min(255, Number(part)).toString(16).padStart(2, "0"))
    .join("")}`
}

function fontName(raw: string): FontName | undefined {
  const value = raw.toLowerCase()
  if (value.includes("mono") || value.includes("fira")) return "mono"
  if (value.includes("sans")) return "sans"
  if (value.includes("serif") || value.includes("lora") || value.includes("georgia")) return "serif"
}

function parseStyle(style: string): Mark {
  const mark: Mark = {}
  const color = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(style)
  if (color) {
    const hex = toHex(color[1])
    if (hex) mark.color = hex
  }
  const font = /(?:^|;)\s*font-family\s*:\s*([^;]+)/i.exec(style)
  if (font) {
    const name = fontName(font[1])
    if (name) mark.font = name
  }
  if (/font-weight\s*:\s*(bold|[6-9]00)\b/i.test(style)) mark.bold = true
  if (/font-style\s*:\s*italic\b/i.test(style)) mark.italic = true
  if (/text-decoration(?:-line)?\s*:\s*[^;]*underline/i.test(style)) mark.under = true
  return mark
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g
  let match: RegExpExecArray | null
  while ((match = re.exec(raw))) {
    attrs[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? "")
  }
  return attrs
}

function safeSrc(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length > 2000) return null
  try {
    const url = new URL(trimmed)
    if (url.protocol !== "https:" || url.username || url.password) return null
    return url.href
  } catch {
    return null
  }
}

function cleanAlt(alt: string): string {
  return alt.replace(/<[^>]*>/g, "").replace(/[\u0000-\u001f]/g, "").slice(0, 180)
}

function sameTag(open: string, close: string): boolean {
  const alias = (tag: string) => (tag === "b" ? "strong" : tag === "i" ? "em" : tag === "ol" ? "ul" : tag)
  return alias(open) === alias(close)
}

function markFrom(name: string, attrText: string): { tag: string; mark: Mark } | null {
  if (name === "b" || name === "strong") return { tag: "strong", mark: { bold: true } }
  if (name === "i" || name === "em") return { tag: "em", mark: { italic: true } }
  if (name === "u") return { tag: "u", mark: { under: true } }
  if (name === "span" || name === "font") {
    const attrs = parseAttrs(attrText)
    const mark = parseStyle(attrs.style || "")
    const color = toHex(attrs.color || "")
    if (color) mark.color = color
    if (attrs["data-font"] === "serif" || attrs["data-font"] === "sans" || attrs["data-font"] === "mono") {
      mark.font = attrs["data-font"]
    }
    return { tag: "span", mark }
  }
  return null
}

function pushNode(out: RichNode[], node: RichNode) {
  if (node.t === "text") {
    if (!node.v) return
    const prev = out[out.length - 1]
    if (prev?.t === "text") prev.v += node.v
    else out.push({ t: "text", v: node.v })
    return
  }
  out.push(node)
}

function normalize(nodes: RichNode[]): RichNode[] {
  const out: RichNode[] = []
  for (const node of nodes) {
    const next = clean(node)
    if (!next) continue
    if (Array.isArray(next)) {
      for (const child of next) pushNode(out, child)
    } else pushNode(out, next)
  }
  return out
}

function clean(node: RichNode): RichNode | RichNode[] | null {
  if (node.t === "text") return node.v ? node : null
  if (node.t === "br" || node.t === "img") return node
  if (node.t === "ul") {
    if (!node.items.length) return null
    return {
      t: "ul",
      items: node.items.map((item) => {
        const children = normalize(item)
        if (children.length === 1 && children[0].t === "br") return []
        return children
      }),
    }
  }
  const children = normalize(node.c)
  if (!children.length) return null
  if (node.t === "span" && !node.color && !node.font) return children
  if ((node.t === "strong" || node.t === "em" || node.t === "u") && children.length === 1 && children[0].t === node.t) {
    return children[0]
  }
  if (node.t === "span" && children.length === 1 && children[0].t === "span") {
    const inner = children[0]
    return { t: "span", color: node.color ?? inner.color, font: node.font ?? inner.font, c: inner.c }
  }
  return node.t === "span" ? { ...node, c: children } : { t: node.t, c: children }
}

function applyMark(nodes: RichNode[], mark: Mark): RichNode[] {
  let wrapped = nodes
  if (mark.color || mark.font) wrapped = [{ t: "span", color: mark.color, font: mark.font, c: wrapped }]
  if (mark.bold) wrapped = [{ t: "strong", c: wrapped }]
  if (mark.italic) wrapped = [{ t: "em", c: wrapped }]
  if (mark.under) wrapped = [{ t: "u", c: wrapped }]
  return wrapped
}

function parseHtml(input: string): RichNode[] {
  const root: Frame = { kind: "block", tag: "root", nodes: [] }
  const stack: Frame[] = [root]
  let i = 0

  function top() {
    return stack[stack.length - 1]
  }

  function nodesOf(frame: Frame): RichNode[] {
    if (frame.kind === "ul") {
      const li: Frame = { kind: "li", tag: "li", nodes: [] }
      stack.push(li)
      return li.nodes
    }
    return frame.nodes
  }

  function addText(text: string) {
    if (!text) return
    const nodes = nodesOf(top())
    const prev = nodes[nodes.length - 1]
    if (prev?.t === "text") prev.v += text
    else nodes.push({ t: "text", v: text })
  }

  function addNode(node: RichNode) {
    nodesOf(top()).push(node)
  }

  function closeTop() {
    if (stack.length === 1) return
    const frame = stack.pop()!
    const parent = top()
    if (frame.kind === "li") {
      const item = normalize(frame.nodes)
      const cleaned = item.length === 1 && item[0].t === "br" ? [] : item
      if (parent.kind === "ul") parent.items.push(cleaned)
      else for (const node of cleaned) addNode(node)
      return
    }
    if (frame.kind === "ul") {
      if (frame.items.length) addNode({ t: "ul", items: frame.items })
      return
    }
    if (frame.kind === "inline") {
      for (const node of applyMark(normalize(frame.nodes), frame.mark)) addNode(node)
      return
    }
    if (frame.kind === "skip") {
      for (const node of normalize(frame.nodes)) addNode(node)
      return
    }
    const nodes = normalize(frame.nodes)
    if (parent.kind === "ul") {
      parent.items.push(nodes.length === 1 && nodes[0].t === "br" ? [] : nodes)
      return
    }
    const dest = parent.nodes
    if (dest.length) {
      const prev = dest[dest.length - 1]
      if (prev?.t !== "br") dest.push({ t: "br" })
    }
    dest.push(...nodes)
  }

  function matches(frame: Frame, name: string) {
    if (frame.kind === "ul") return name === "ul" || name === "ol"
    if (frame.kind === "li") return name === "li"
    return sameTag(frame.tag, name)
  }

  function closeTag(name: string) {
    for (let index = stack.length - 1; index > 0; index -= 1) {
      if (!matches(stack[index], name)) continue
      while (stack.length - 1 > index) closeTop()
      closeTop()
      return
    }
  }

  function openTag(name: string, attrText: string) {
    if (name === "br") {
      addNode({ t: "br" })
      return
    }
    if (name === "img") {
      const attrs = parseAttrs(attrText)
      const src = safeSrc(attrs.src || "")
      if (src) addNode({ t: "img", src, alt: cleanAlt(attrs.alt || "") })
      return
    }
    if (name === "ul" || name === "ol") {
      stack.push({ kind: "ul", tag: "ul", items: [] })
      return
    }
    if (name === "li") {
      if (top().kind !== "ul") stack.push({ kind: "ul", tag: "ul", items: [] })
      stack.push({ kind: "li", tag: "li", nodes: [] })
      return
    }
    if (BLOCKS.has(name)) {
      stack.push({ kind: "block", tag: name, nodes: [] })
      return
    }
    const marked = markFrom(name, attrText)
    if (marked) {
      stack.push({ kind: "inline", tag: marked.tag, nodes: [], mark: marked.mark })
      return
    }
    stack.push({ kind: "skip", tag: name, nodes: [] })
  }

  while (i < input.length && stack.length < 80) {
    const lt = input.indexOf("<", i)
    if (lt === -1) {
      addText(decode(input.slice(i)))
      break
    }
    if (lt > i) addText(decode(input.slice(i, lt)))
    if (input.startsWith("<!--", lt)) {
      const end = input.indexOf("-->", lt + 4)
      i = end === -1 ? input.length : end + 3
      continue
    }
    const gt = input.indexOf(">", lt + 1)
    if (gt === -1) {
      addText(input.slice(lt))
      break
    }
    const raw = input.slice(lt + 1, gt).trim()
    if (!/^\/?[a-zA-Z]/.test(raw)) {
      addText("<")
      i = lt + 1
      continue
    }
    const closing = raw.startsWith("/")
    const body = (closing ? raw.slice(1) : raw.replace(/\/$/, "")).trim()
    const nameMatch = /^([a-zA-Z][a-zA-Z0-9]*)/.exec(body)
    if (!nameMatch) {
      addText("<")
      i = lt + 1
      continue
    }
    const name = nameMatch[1].toLowerCase()
    i = gt + 1
    if (name === "script" || name === "style") {
      if (!closing) {
        const endTag = new RegExp(`</${name}\\s*>`, "i")
        const found = endTag.exec(input.slice(i))
        i = found ? i + found.index + found[0].length : input.length
      }
      continue
    }
    if (closing) closeTag(name)
    else openTag(name, body.slice(nameMatch[1].length))
  }

  while (stack.length > 1) closeTop()
  return normalize(root.nodes)
}

function hasFormatting(nodes: RichNode[]): boolean {
  return nodes.some((node) => node.t !== "text")
}

function plainFromNodes(nodes: RichNode[]): string {
  let out = ""
  for (const node of nodes) {
    if (node.t === "text") out += node.v
    else if (node.t === "br") out += "\n"
    else if (node.t === "img") out += node.alt
    else if (node.t === "ul") out += node.items.map((item) => plainFromNodes(item)).join("\n")
    else out += plainFromNodes(node.c)
  }
  return out
}

function serializeNode(node: RichNode): string {
  if (node.t === "text") return escapeHtml(node.v)
  if (node.t === "br") return "<br>"
  if (node.t === "img") return `<img src="${escapeAttr(node.src)}" alt="${escapeAttr(node.alt)}">`
  if (node.t === "ul") {
    return `<ul>${node.items.map((item) => `<li>${item.length ? serialize(item) : "<br>"}</li>`).join("")}</ul>`
  }
  if (node.t === "span") {
    const attrs: string[] = []
    if (node.font) attrs.push(`data-font="${node.font}"`)
    if (node.color) attrs.push(`style="color:${node.color}"`)
    return `<span ${attrs.join(" ")}>${serialize(node.c)}</span>`
  }
  return `<${node.t}>${serialize(node.c)}</${node.t}>`
}

function serialize(nodes: RichNode[]): string {
  return nodes.map(serializeNode).join("")
}

function toNodes(value: string): RichNode[] {
  if (!value) return []
  let source = value.length > 100_000 ? value.slice(0, 100_000) : value
  if (!source.includes("<")) {
    if (!source.includes("&")) return [{ t: "text", v: source }]
    const decoded = decode(source)
    if (!decoded.includes("<")) return decoded ? [{ t: "text", v: decoded }] : []
    source = decoded
  }
  return parseHtml(source)
}

export function sanitizeRichText(value: string): string {
  if (!value) return ""
  if (!value.includes("<") && !value.includes("&")) return value
  const nodes = toNodes(value)
  if (!hasFormatting(nodes)) return plainFromNodes(nodes)
  return serialize(nodes)
}

export function plainText(value: string): string {
  if (!value) return ""
  if (!value.includes("<") && !value.includes("&")) return value
  return plainFromNodes(toNodes(value))
}

export function richNodes(value: string): RichNode[] {
  if (!value) return []
  if (!value.includes("<") && !value.includes("&")) return [{ t: "text", v: value }]
  return toNodes(value)
}

function linesOf(nodes: RichNode[]): RichNode[][] {
  const lines: RichNode[][] = [[]]
  const stack: Array<(child: RichNode) => RichNode> = []

  function emit(node: RichNode) {
    let wrapped = node
    for (let index = stack.length - 1; index >= 0; index -= 1) wrapped = stack[index](wrapped)
    const line = lines[lines.length - 1]
    const prev = line[line.length - 1]
    if (wrapped.t === "text" && prev?.t === "text") prev.v += wrapped.v
    else if (wrapped.t !== "text" || wrapped.v) line.push(wrapped)
  }

  function walk(list: RichNode[]) {
    for (const node of list) {
      if (node.t === "text") {
        const parts = node.v.split("\n")
        parts.forEach((part, index) => {
          if (index > 0) lines.push([])
          if (part) emit({ t: "text", v: part })
        })
      } else if (node.t === "br") {
        lines.push([])
      } else if (node.t === "img") {
        emit(node)
      } else if (node.t === "ul") {
        for (const item of node.items) {
          if (lines[lines.length - 1].length) lines.push([])
          walk(item)
          lines.push([])
        }
      } else {
        stack.push((child) =>
          node.t === "span"
            ? { t: "span", color: node.color, font: node.font, c: [child] }
            : { t: node.t, c: [child] },
        )
        walk(node.c)
        stack.pop()
      }
    }
  }

  walk(nodes)
  while (lines.length > 1 && lines[lines.length - 1].length === 0) lines.pop()
  return lines
}

export function splitIntoItems(value: string): string {
  const nodes = toNodes(value)
  if (nodes.length === 1 && nodes[0].t === "ul") {
    return serialize([{ t: "ul", items: [...nodes[0].items, []] }])
  }
  const lines = linesOf(nodes)
  const items = lines.length <= 1 ? [lines[0] ?? [], []] : lines
  return serialize([{ t: "ul", items }])
}

function stripNodes(nodes: RichNode[]): RichNode[] {
  const out: RichNode[] = []
  for (const node of nodes) {
    if (node.t === "text" || node.t === "br" || node.t === "img") out.push(node)
    else if (node.t === "ul") out.push({ t: "ul", items: node.items.map((item) => stripNodes(item)) })
    else out.push(...stripNodes(node.c))
  }
  return normalize(out)
}

export function stripInlineFormatting(value: string): string {
  const nodes = stripNodes(toNodes(value))
  if (!hasFormatting(nodes)) return plainFromNodes(nodes)
  return serialize(nodes)
}

export function editorValue(html: string): string {
  const clean = sanitizeRichText(html)
  if (!plainText(clean).trim() && !clean.includes("<img") && !clean.includes("<ul")) return ""
  return clean
}
