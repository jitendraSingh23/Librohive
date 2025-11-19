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

    // Check if user has saved the book
    const save = await db.bookSave.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: book.id
        }
      }
    })

    return NextResponse.json({
      isSaved: !!save
    })
  } catch (error) {
    console.error("[BOOK_SAVES_GET]", error)
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

    // Check if user has already saved the book
    const existingSave = await db.bookSave.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: book.id
        }
      }
    })

    if (existingSave) {
      // Unsave the book
      await db.bookSave.delete({
        where: {
          userId_bookId: {
            userId: session.user.id,
            bookId: book.id
          }
        }
      })
      return NextResponse.json({
        isSaved: false
      })
    } else {
      // Save the book
      const save = await db.bookSave.create({
        data: {
          userId: session.user.id,
          bookId: book.id
        }
      })
      return NextResponse.json({
        isSaved: true,
        saveId: save.id
      })
    }
  } catch (error) {
    console.error("[BOOK_SAVES_POST]", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 