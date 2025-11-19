import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Find the book by ID
    const book = await db.book.findUnique({
      where: { id: params.id }
    })

    if (!book) {
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      )
    }

    // Check if user has liked the book
    const like = await db.bookLike.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: book.id
        }
      }
    })

    // Get total likes count
    const likeCount = await db.bookLike.count({
      where: {
        bookId: book.id
      }
    })

    return NextResponse.json({
      isLiked: !!like,
      likeCount
    })
  } catch (error) {
    console.error("[BOOK_LIKES_GET]", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Find the book by ID
    const book = await db.book.findUnique({
      where: { id: params.id }
    })

    if (!book) {
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      )
    }

    // Check if user has already liked the book
    const existingLike = await db.bookLike.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: book.id
        }
      }
    })

    if (existingLike) {
      // Unlike the book
      await db.bookLike.delete({
        where: {
          userId_bookId: {
            userId: session.user.id,
            bookId: book.id
          }
        }
      })
    } else {
      // Like the book
      await db.bookLike.create({
        data: {
          userId: session.user.id,
          bookId: book.id
        }
      })
    }

    // Get updated like status and count
    const like = await db.bookLike.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: book.id
        }
      }
    })

    const likeCount = await db.bookLike.count({
      where: {
        bookId: book.id
      }
    })

    return NextResponse.json({
      isLiked: !!like,
      likeCount
    })
  } catch (error) {
    console.error("[BOOK_LIKES_POST]", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 