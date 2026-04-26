import type { BlogPost } from "./blog-data"

export function generateBlogPostingSchema(post: BlogPost, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`,
    },
    publisher: {
      "@type": "Person",
      name: post.author.name,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
    wordCount: post.content.split(/\s+/).length,
    timeRequired: `PT${parseInt(post.readTime)}M`,
  }
}

export function generateBlogListSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog de Mathías Andino",
    description: "Artículos sobre desarrollo de videojuegos, game design y programación",
    url: `${baseUrl}/blog`,
    author: {
      "@type": "Person",
      name: "Mathías Andino",
      jobTitle: "Technical Game Designer",
    },
  }
}
