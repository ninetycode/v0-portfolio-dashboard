import { boolean, date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

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
