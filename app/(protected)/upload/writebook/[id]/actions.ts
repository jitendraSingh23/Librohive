'use server'

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { BookSchema } from "@/components/book/BookForm"

export async function updateBookAction(bookId: string, data: z.infer<typeof BookSchema>) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    // Delete existing chapters
    await db.chapter.deleteMany({
      where: {
        bookId,
      },
    })

    // Update book with new data
    const book = await db.book.update({
      where: {
        id: bookId,
        authorId: session.user.id,
      },
      data: {
        title: data.title,
        description: data.description,
        tags: data.tags,
        chapters: {
          create: data.chapters.map((chapter, index) => ({
            title: chapter.title,
            content: chapter.content,
            order: index + 1,
          })),
        },
        published: data.published,
      },
    })

    return book
  } catch (error) {
    console.error("Error updating book:", error)
    throw error
  }
} 