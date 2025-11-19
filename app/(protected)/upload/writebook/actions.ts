'use server'

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { BookSchema } from "@/components/book/BookForm"
import { revalidatePath } from "next/cache"

export async function createBook(data: z.infer<typeof BookSchema>) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    const book = await db.book.create({
      data: {
        title: data.title,
        description: data.description,
        tags: data.tags,
        authorId: session.user.id,
        chapters: {
          create: data.chapters.map((chapter, index) => ({
            title: chapter.title,
            content: chapter.content,
            order: index + 1,
          })),
        },
        published: data.published,
      },
      include: {
        chapters: true
      }
    })

    revalidatePath("/dashboard")
    return book
  } catch (error) {
    console.error('Error creating book:', error)
    throw error
  }
}

export async function updateBookAction(bookId: string, data: z.infer<typeof BookSchema>) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    // First, delete all reading progress records for the book's chapters
    await db.readingProgress.deleteMany({
      where: {
        chapter: {
          bookId: bookId
        }
      }
    })

    // Then delete all chapters
    await db.chapter.deleteMany({
      where: {
        bookId: bookId
      }
    })

    // Finally, update the book with new data
    const updatedBook = await db.book.update({
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
      include: {
        chapters: true
      }
    })

    revalidatePath("/dashboard")
    return updatedBook
  } catch (error) {
    console.error("Error updating book:", error)
    throw error
  }
} 