import type { GameDocLink } from "@/lib/db/schema"

export type GameSummary = {
  id: string
  slug: string
  title: string
  shortDescription: string
  genres: string[]
  platforms: string[]
  releaseType: string
  coverImage: string | null
  status: string
  playable: boolean
  avgRating: number | null
  reviewCount: number
}

export type GameReview = {
  id: string
  name: string
  rating: number
  comment: string
  adminReply: string | null
  adminReplyAt: string | null
  createdAt: string
}

export type GameInput = {
  title: string
  slug: string
  shortDescription: string
  description: string
  controls: string
  genres: string[]
  platforms: string[]
  engine: string
  status: string
  releaseType: string
  embedUrl: string
  embedWidth: number
  embedHeight: number
  externalUrl: string
  coverImage: string
  screenshots: string[]
  docLinks: GameDocLink[]
}

export type GameDetail = {
  id: string
  slug: string
  title: string
  shortDescription: string
  description: string
  controls: string
  genres: string[]
  platforms: string[]
  engine: string | null
  status: string
  releaseType: string
  embedUrl: string | null
  embedWidth: number
  embedHeight: number
  externalUrl: string | null
  coverImage: string | null
  screenshots: string[]
  docLinks: GameDocLink[]
  sortOrder: number
  createdAt: string
  avgRating: number | null
  reviewCount: number
  reviews: GameReview[]
}
