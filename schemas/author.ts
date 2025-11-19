import { z } from "zod";

export const BookSchema = z.object({
  id: z.string(),
  title: z.string(),
  coverImage: z.string().nullable()
});

export const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  _count: z.object({
    books: z.number(),
    followers: z.number()
  }),
  books: z.array(BookSchema)
});

export const AuthorListSchema = z.array(AuthorSchema);