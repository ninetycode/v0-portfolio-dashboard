import type { FontName } from "./rich-text"

export type InlineFormat = "bold" | "italic" | "underline" | "strike"

export type ActiveFormats = Record<InlineFormat, boolean>

type Matcher = (el: HTMLElement) => boolean

const FORMATS: Record<InlineFormat, { tag: string; tags: string[]; command: string }> = {
  bold: { tag: "strong", tags: ["B", "STRONG"], command: "bold" },
  italic: { tag: "em", tags: ["I", "EM"], command: "italic" },
  underline: { tag: "u", tags: ["U"], command: "underline" },
  strike: { tag: "s", tags: ["S", "STRIKE", "DEL"], command: "strikeThrough" },
}

export const NO_FORMATS: ActiveFormats = { bold: false, italic: false, underline: false, strike: false }

const WORD_CHAR = /[\p{L}\p{N}_]/u

const matcherFor = (format: InlineFormat): Matcher => (el) => FORMATS[format].tags.includes(el.tagName)
const hasColor: Matcher = (el) => (el.tagName === "SPAN" || el.tagName === "FONT") && (!!el.style.color || el.hasAttribute("color"))
const hasFont: Matcher = (el) => el.tagName === "SPAN" && el.hasAttribute("data-font")

function closestMatch(node: Node, root: HTMLElement, match: Matcher): HTMLElement | null {
  let current: Node | null = node.nodeType === 1 ? node : node.parentNode
  while (current && current !== root) {
    if (current.nodeType === 1 && match(current as HTMLElement)) return current as HTMLElement
    current = current.parentNode
  }
  return null
}

function unwrap(el: HTMLElement) {
  const parent = el.parentNode
  if (!parent) return
  while (el.firstChild) parent.insertBefore(el.firstChild, el)
  parent.removeChild(el)
}

function isEmptyFragment(fragment: DocumentFragment) {
  return !fragment.textContent && !fragment.querySelector("img,br")
}

// Splits `wrapper` so that it only contains `text`; what came before/after is kept in clones of the wrapper.
function isolate(text: Text, wrapper: HTMLElement) {
  const parent = wrapper.parentNode
  if (!parent) return
  const before = document.createRange()
  before.setStart(wrapper, 0)
  before.setEndBefore(text)
  const head = before.extractContents()
  if (!isEmptyFragment(head)) {
    const clone = wrapper.cloneNode(false)
    clone.appendChild(head)
    parent.insertBefore(clone, wrapper)
  }
  const after = document.createRange()
  after.setStartAfter(text)
  after.setEnd(wrapper, wrapper.childNodes.length)
  const tail = after.extractContents()
  if (!isEmptyFragment(tail)) {
    const clone = wrapper.cloneNode(false)
    clone.appendChild(tail)
    parent.insertBefore(clone, wrapper.nextSibling)
  }
}

function wrapText(text: Text, el: HTMLElement) {
  text.parentNode?.insertBefore(el, text)
  el.appendChild(text)
}

function intersectingTexts(root: HTMLElement, range: Range): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const out: Text[] = []
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text
    if (text.length && range.intersectsNode(text)) out.push(text)
  }
  return out
}

// Splits the text nodes at the selection edges so every returned node is fully inside the selection.
function boundaryTexts(root: HTMLElement, range: Range): Text[] {
  const { startContainer, startOffset, endContainer, endOffset } = range
  let endNode: Node = endContainer
  let endAt = endOffset
  if (endContainer.nodeType === 3) {
    const text = endContainer as Text
    if (endOffset < text.length) text.splitText(endOffset)
  }
  let startNode: Node = startContainer
  let startAt = startOffset
  if (startContainer.nodeType === 3) {
    const text = startContainer as Text
    if (startOffset > 0 && startOffset < text.length) {
      const tail = text.splitText(startOffset)
      if (endNode === text) endNode = tail
      startNode = tail
      startAt = 0
    }
  }
  if (endNode.nodeType === 3) endAt = (endNode as Text).length
  const inner = document.createRange()
  inner.setStart(startNode, startAt)
  inner.setEnd(endNode, endAt)
  return intersectingTexts(root, inner)
}

function sameElement(a: Element, b: Element) {
  if (a.tagName !== b.tagName || a.attributes.length !== b.attributes.length) return false
  return Array.from(a.attributes).every((attr) => b.getAttribute(attr.name) === attr.value)
}

// Joins neighbouring identical inline wrappers (<strong>a</strong><strong>b</strong>) so the markup stays clean.
// Text nodes are moved, never recreated, so ranges built on them stay valid.
function mergeAdjacent(root: HTMLElement) {
  const inline = root.querySelectorAll("strong,b,em,i,u,s,span")
  for (const node of Array.from(inline)) {
    const prev = node.previousSibling
    if (!node.isConnected || !prev || prev.nodeType !== 1 || !sameElement(prev as Element, node)) continue
    while (node.firstChild) prev.appendChild(node.firstChild)
    node.remove()
  }
  for (const node of Array.from(root.querySelectorAll("strong,b,em,i,u,s,span"))) {
    if (!node.textContent && !node.querySelector("img,br")) node.remove()
  }
}

function rangeAround(texts: Text[]): Range | null {
  const root = texts[0]?.parentElement?.closest("[contenteditable]") as HTMLElement | null
  if (root) mergeAdjacent(root)
  if (!texts.length) return null
  const range = document.createRange()
  range.setStart(texts[0], 0)
  const last = texts[texts.length - 1]
  range.setEnd(last, last.length)
  return range
}

export function currentRange(root: HTMLElement, saved: Range | null): Range | null {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0 && root.contains(selection.anchorNode) && root.contains(selection.focusNode)) {
    return selection.getRangeAt(0).cloneRange()
  }
  if (saved && root.contains(saved.commonAncestorContainer)) return saved.cloneRange()
  return null
}

export function wholeRange(root: HTMLElement): Range {
  const range = document.createRange()
  range.selectNodeContents(root)
  return range
}

export function wordAt(range: Range): { range: Range; start: number } | null {
  const node = range.startContainer
  if (node.nodeType !== 3) return null
  const data = (node as Text).data
  let start = range.startOffset
  let end = start
  while (start > 0 && WORD_CHAR.test(data[start - 1])) start -= 1
  while (end < data.length && WORD_CHAR.test(data[end])) end += 1
  if (start === end) return null
  const word = document.createRange()
  word.setStart(node, start)
  word.setEnd(node, end)
  return { range: word, start }
}

export function formatsAt(root: HTMLElement, range: Range): ActiveFormats {
  const result = { ...NO_FORMATS }
  const texts = range.collapsed ? [] : intersectingTexts(root, range)
  const meaningful = texts.filter((text) => text.data.trim())
  const basis = meaningful.length ? meaningful : texts
  for (const format of Object.keys(FORMATS) as InlineFormat[]) {
    const match = matcherFor(format)
    result[format] = basis.length
      ? basis.every((text) => closestMatch(text, root, match))
      : range.collapsed && !!closestMatch(range.startContainer, root, match)
  }
  return result
}

export function toggleFormat(root: HTMLElement, range: Range, format: InlineFormat): Range | null {
  const match = matcherFor(format)
  const texts = boundaryTexts(root, range)
  if (!texts.length) return null
  const meaningful = texts.filter((text) => text.data.trim())
  const basis = meaningful.length ? meaningful : texts
  const remove = basis.every((text) => closestMatch(text, root, match))
  for (const text of texts) {
    if (remove) {
      let found = closestMatch(text, root, match)
      while (found) {
        isolate(text, found)
        unwrap(found)
        found = closestMatch(text, root, match)
      }
    } else if (!closestMatch(text, root, match)) {
      wrapText(text, document.createElement(FORMATS[format].tag))
    }
  }
  return rangeAround(texts)
}

function stripSpanProp(el: HTMLElement, prop: "color" | "font") {
  if (prop === "color") {
    el.style.removeProperty("color")
    el.removeAttribute("color")
  } else {
    el.removeAttribute("data-font")
  }
  if (!el.getAttribute("style")?.trim()) el.removeAttribute("style")
  const keepsFont = el.hasAttribute("data-font")
  const keepsColor = !!el.style.color
  if (el.tagName === "FONT" ? !keepsColor : !keepsFont && !keepsColor) unwrap(el)
}

function restyle(root: HTMLElement, range: Range, prop: "color" | "font", value: string | null): Range | null {
  const match = prop === "color" ? hasColor : hasFont
  const texts = boundaryTexts(root, range)
  if (!texts.length) return null
  for (const text of texts) {
    let found = closestMatch(text, root, match)
    while (found) {
      isolate(text, found)
      stripSpanProp(found, prop)
      found = closestMatch(text, root, match)
    }
    if (!value) continue
    const span = document.createElement("span")
    if (prop === "color") span.style.color = value
    else span.setAttribute("data-font", value)
    wrapText(text, span)
  }
  return rangeAround(texts)
}

export function setColor(root: HTMLElement, range: Range, color: string | null) {
  return restyle(root, range, "color", color)
}

export function setFont(root: HTMLElement, range: Range, font: FontName | null) {
  return restyle(root, range, "font", font)
}

export function commandFor(format: InlineFormat) {
  return FORMATS[format].command
}
