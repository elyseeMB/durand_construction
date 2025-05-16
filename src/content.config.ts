import { defineCollection, reference, z } from "astro:content";

import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/blog" }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    isDraft: z.boolean().default(false),
    taxonomies: z.array(reference("taxonomies")).optional(),
    thumbnail: z.string().optional(),
    description: z.string().optional(),
    // description: z.string(),
    // pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: reference("authors"),
    relatedPosts: z.array(reference("blog")).optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        canonicalURL: z.string().url().optional(),
        typeContent: z.string().optional().default("website"),
        tags: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

const authors = defineCollection({
  loader: glob({ pattern: "**/[^_]*.json", base: "./src/data/authors" }),
  schema: z.object({
    name: z.string(),
    portfolio: z.string().url(),
  }),
});

const taxonomies = defineCollection({
  loader: glob({ pattern: "**/[^_]*.json", base: "./src/data/taxonomies" }),
  schema: z.object({
    name: z.string(),
    // posts: z.array(reference("blog")).optional(),
  }),
});

export const collections = { blog, authors, taxonomies };
