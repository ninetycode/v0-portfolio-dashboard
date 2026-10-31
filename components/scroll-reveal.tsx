"use client"

import { useEffect } from "react"

const SELECTOR = "[data-reveal]"
const REVEAL_ANIMATIONS = new Set(["reveal-rise", "reveal-pop"])

function resetPending(node: HTMLElement) {
  node.classList.remove("reveal-arm", "is-revealed")
  delete node.dataset.revealBound
  node.style.removeProperty("--reveal-delay")
}

export function ScrollReveal() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return

    let batch: HTMLElement[] = []
    let frame = 0

    const flush = () => {
      frame = 0
      const items = batch
      batch = []
      items.sort((a, b) => {
        const ra = a.getBoundingClientRect()
        const rb = b.getBoundingClientRect()
        return ra.top - rb.top || ra.left - rb.left
      })
      items.forEach((node, index) => {
        node.style.setProperty("--reveal-delay", `${Math.min(index, 6) * 120}ms`)
        node.classList.add("is-revealed")
      })
    }

    const queue = (node: HTMLElement) => {
      batch.push(node)
      if (!frame) frame = requestAnimationFrame(flush)
    }

    const readyToReveal = (rect: DOMRect) => {
      const viewport = window.innerHeight
      const visible = Math.min(rect.bottom, viewport) - Math.max(rect.top, 0)
      if (visible <= 0 || rect.height <= 0) return false
      const span = Math.min(rect.height, viewport)
      const needed = Math.min(180, Math.max(72, span * 0.34))
      return visible >= needed && rect.top < viewport * 0.9
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const node = entry.target as HTMLElement
          if (!readyToReveal(node.getBoundingClientRect())) continue
          observer.unobserve(node)
          queue(node)
        }
      },
      { threshold: [0, 0.2, 0.45, 0.7] },
    )

    const onAnimationEnd = (event: AnimationEvent) => {
      const node = event.target
      if (!(node instanceof HTMLElement) || !node.hasAttribute("data-reveal")) return
      if (!REVEAL_ANIMATIONS.has(event.animationName)) return
      node.classList.add("reveal-done")
      node.classList.remove("reveal-arm", "is-revealed")
    }

    const arm = (node: HTMLElement, animateIfVisible: boolean) => {
      if (node.dataset.revealBound === "1" || node.classList.contains("reveal-done")) return
      node.dataset.revealBound = "1"

      const rect = node.getBoundingClientRect()
      const onScreen = readyToReveal(rect)

      if (!animateIfVisible && onScreen && rect.top < window.innerHeight * 0.42) {
        node.classList.add("reveal-done")
        return
      }

      node.classList.add("reveal-arm")
      if (onScreen) queue(node)
      else observer.observe(node)
    }

    document.querySelectorAll<HTMLElement>(SELECTOR).forEach((node) => arm(node, false))

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((added) => {
          if (!(added instanceof HTMLElement)) return
          if (added.matches(SELECTOR)) arm(added, true)
          added.querySelectorAll<HTMLElement>(SELECTOR).forEach((node) => arm(node, true))
        })
      }
    })
    mutations.observe(document.body, { childList: true, subtree: true })
    document.addEventListener("animationend", onAnimationEnd)

    return () => {
      observer.disconnect()
      mutations.disconnect()
      document.removeEventListener("animationend", onAnimationEnd)
      if (frame) cancelAnimationFrame(frame)
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((node) => {
        if (!node.classList.contains("reveal-done")) resetPending(node)
      })
    }
  }, [])

  return null
}
