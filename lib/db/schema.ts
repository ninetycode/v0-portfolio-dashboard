import { boolean, date, integer, jsonb, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  category: text("category").notNull().default("Devlogs"),
  tags: text("tags").array().notNull().default([]),
  readTime: text("read_time").notNull().default("5 min"),
  coverImage: text("cover_image"),
  featured: boolean("featured").notNull().default(false),
  color: text("color").notNull().default("from-primary/20 to-accent/20"),
  publishedAt: date("published_at").notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export type BlogPostRow = typeof blogPosts.$inferSelect
export type NewBlogPostRow = typeof blogPosts.$inferInsert

export type GameDocLink = { label: string; url: string }

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  shortDescription: text("short_description").notNull().default(""),
  description: text("description").notNull().default(""),
  controls: text("controls").notNull().default(""),
  genres: text("genres").array().notNull().default([]),
  platforms: text("platforms").array().notNull().default([]),
  engine: text("engine"),
  status: text("status").notNull().default("Released"),
  releaseType: text("release_type").notNull().default("browser"),
  embedUrl: text("embed_url"),
  embedWidth: integer("embed_width").notNull().default(1280),
  embedHeight: integer("embed_height").notNull().default(740),
  externalUrl: text("external_url"),
  coverImage: text("cover_image"),
  screenshots: text("screenshots").array().notNull().default([]),
  docLinks: jsonb("doc_links").$type<GameDocLink[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const gameReviews = pgTable("game_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id").notNull(),
  name: text("name").notNull(),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
  comment: text("comment").notNull().default(""),
  adminReply: text("admin_reply"),
  adminReplyAt: timestamp("admin_reply_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type GameRow = typeof games.$inferSelect
export type GameReviewRow = typeof gameReviews.$inferSelect
