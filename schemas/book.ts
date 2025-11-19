import * as z from "zod"

export const BookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()),
  published: z.boolean().default(false),
  chapters: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, "Chapter title is required"),
    content: z.string().min(1, "Chapter content is required"),
    order: z.number().min(1, "Chapter order must be at least 1")
  }))
})

export type BookFormValues = z.infer<typeof BookSchema>
  