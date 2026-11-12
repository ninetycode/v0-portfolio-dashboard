"use client"

import { useEffect } from "react"

const SELECTOR = "[data-reveal]"
const REVEAL_ANIMATIONS = new Set(["reveal-rise", "reveal-pop"])

const STORAGE_KEY = "animations"

type AnimationsApi = {
  on: () => string
  off: () => string
  toggle: () => string
  status: () => string
}

declare global {
  interface Window {
    animations?: AnimationsApi
    animaciones?: AnimationsApi
  }
}

function readStoredPreference() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off"
  } catch {
    return true
  }
}

function storePreference(enabled: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off")
  } catch {
    // Storage can be blocked; the toggle still works for the current page.
  }
}

function resetPending(node: HTMLElement) {
  node.classList.remove("reveal-arm", "is-revealed")
  delete node.dataset.revealBound
  node.style.removeProperty("--reveal-delay")
}

function startScrollReveal() {
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
        node.style.setProperty("--reveal-delay", `${Math.min(index, 6) * 70}ms`)
        node.classList.add("is-revealed")
      })
    }

    const queue = (node: HTMLElement) => {
      batch.push(node)
      if (!frame) frame = requestAnimationFrame(flush)
    }

    const readyToReveal = (rect: DOMRect) => {
      const viewport = window.innerHeight
      if (rect.height <= 0 || rect.bottom <= 8) return false
      return rect.top < viewport * 1.04
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
      { rootMargin: "0px 0px 6% 0px", threshold: [0, 0.05, 0.2] },
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

    let scanFrame = 0
    const scanArmed = () => {
      scanFrame = 0
      document
        .querySelectorAll<HTMLElement>(`${SELECTOR}.reveal-arm:not(.is-revealed):not(.reveal-done)`)
        .forEach((node) => {
          if (!readyToReveal(node.getBoundingClientRect())) return
          observer.unobserve(node)
          queue(node)
        })
    }
    const requestScan = () => {
      if (!scanFrame) scanFrame = requestAnimationFrame(scanArmed)
    }
    window.addEventListener("scroll", requestScan, { passive: true })
    window.addEventListener("resize", requestScan)

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
      window.removeEventListener("scroll", requestScan)
      window.removeEventListener("resize", requestScan)
      if (frame) cancelAnimationFrame(frame)
      if (scanFrame) cancelAnimationFrame(scanFrame)
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((node) => {
        if (!node.classList.contains("reveal-done")) resetPending(node)
      })
    }
}

export function ScrollReveal() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let stop: (() => void) | null = null
    let enabled = readStoredPreference() && !reducedMotion

    const apply = (next: boolean) => {
      if (next === Boolean(stop)) return
      if (next) {
        // Re-arm what the visitor has not reached yet so it animates on scroll again.
        document.querySelectorAll<HTMLElement>(`${SELECTOR}.reveal-done`).forEach((node) => {
          if (node.getBoundingClientRect().top > window.innerHeight) node.classList.remove("reveal-done")
        })
        stop = startScrollReveal()
      } else {
        stop?.()
        stop = null
      }
    }

    const describe = () => {
      if (reducedMotion) return "Animaciones desactivadas por el sistema (prefers-reduced-motion)."
      return enabled ? "Animaciones de scroll: activadas" : "Animaciones de scroll: desactivadas"
    }

    const set = (next: boolean) => {
      if (reducedMotion) return describe()
      enabled = next
      storePreference(next)
      apply(next)
      return describe()
    }

    const api: AnimationsApi = {
      on: () => set(true),
      off: () => set(false),
      toggle: () => set(!enabled),
      status: describe,
    }
    window.animations = api
    window.animaciones = api

    apply(enabled)

    return () => {
      apply(false)
      delete window.animations
      delete window.animaciones
    }
  }, [])

  return null
}
