import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transformBook } from "@/lib/books";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      where: {
        published: true,
      },
      include: {
        author: true,
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            readingProgress: true
          }
        },
        likes: true,
        saves: true,
        ratings: true,
      },
      orderBy: [
        {
          likes: {
            _count: 'desc'
          }
        },
        {
          saves: {
            _count: 'desc'
          }
        }
      ],
      take: 6
    });

    // Transform books using existing utility
    const transformedBooks = books.map(book => transformBook(book));

    return NextResponse.json(transformedBooks, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: "Failed to fetch trending books" },
      { status: 500 }
    );
  }
}