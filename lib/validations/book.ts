import * as z from "zod"

export const BookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()),
  chapters: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, "Chapter title is required"),
    content: z.string(),
  })),
  published: z.boolean().default(false),
}) 