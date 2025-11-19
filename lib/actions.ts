'use server';

import { prisma } from '@/lib/prisma';
import { transformBook } from '@/lib/books';
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function searchBooks(query: string, userId?: string) {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const books = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { author: { name: { contains: query, mode: 'insensitive' } } },
        ],
        AND: {
          OR: [
            { published: true },
            { authorId: userId || '' }
          ]
        }
      },
      include: {
        author: true,
        chapters: {
          include: {
            readingProgress: {
              where: { userId: userId || '' }
            }
          }
        },
        likes: true,
      },
      take: 5,
    });

    return books.map(book => transformBook(book));
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

export async function toggleBookLike(bookId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const existingLike = await db.bookLike.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId
        }
      }
    });

    if (existingLike) {
      await db.bookLike.delete({
        where: { id: existingLike.id }
      });
    } else {
      await db.bookLike.create({
        data: {
          userId: session.user.id,
          bookId
        }
      });
    }

    revalidatePath('/scroll');
    return { success: true };
  } catch (error) {
    return { error: "Failed to toggle like" };
  }
}

export async function toggleBookmark(bookId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const existingBookmark = await db.bookmark.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId
        }
      }
    });

    if (existingBookmark) {
      await db.bookmark.delete({
        where: { id: existingBookmark.id }
      });
    } else {
      await db.bookmark.create({
        data: {
          userId: session.user.id,
          bookId
        }
      });
    }

    revalidatePath('/scroll');
    return { success: true };
  } catch (error) {
    return { error: "Failed to toggle bookmark" };
  }
}

export async function toggleBookSave(bookId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const existingSave = await db.bookSave.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId
        }
      }
    });

    if (existingSave) {
      await db.bookSave.delete({
        where: {
          id: existingSave.id
        }
      });
    } else {
      await db.bookSave.create({
        data: {
          userId: session.user.id,
          bookId
        }
      });
    }

    revalidatePath('/scroll');
    return { success: true };
  } catch (error) {
    return { error: "Failed to save book" };
  }
}