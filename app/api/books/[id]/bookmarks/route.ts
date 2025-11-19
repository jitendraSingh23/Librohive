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

    console.log("[BOOKMARKS_GET] Looking for book with ID:", params.id)

    // Find the book by ID and include chapters to verify it exists
    const book = await db.book.findUnique({
      where: { id: params.id },
      include: {
        chapters: {
          select: {
            id: true,
            title: true,
            order: true
          }
        }
      }
    })

    if (!book) {
      console.log("[BOOKMARKS_GET] Book not found with ID:", params.id)
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      )
    }

    console.log("[BOOKMARKS_GET] Found book:", book.title)

    // Get all bookmarks for this book and user
    const bookmarks = await db.bookmark.findMany({
      where: {
        bookId: book.id,
        userId: session.user.id
      },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            order: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log("[BOOKMARKS_GET] Found bookmarks:", bookmarks.length)
    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error("[BOOKMARKS_GET] Error:", error)
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

    console.log("[BOOKMARKS_POST] Creating bookmark for book:", params.id)

    // Find the book by ID and include chapters to verify it exists
    const book = await db.book.findUnique({
      where: { id: params.id },
      include: {
        chapters: {
          select: {
            id: true
          }
        }
      }
    })

    if (!book) {
      console.log("[BOOKMARKS_POST] Book not found with ID:", params.id)
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { selectedText, position, note, selectionStart, selectionEnd, selectionWidth, selectionLeft, chapterId } = body

    if (!selectedText || position === undefined || !chapterId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify the chapter belongs to this book
    if (!book.chapters.some(ch => ch.id === chapterId)) {
      return NextResponse.json(
        { message: "Chapter does not belong to this book" },
        { status: 400 }
      )
    }

    const bookmark = await db.bookmark.create({
      data: {
        userId: session.user.id,
        bookId: book.id,
        chapterId,
        selectedText,
        position,
        note,
        selectionStart,
        selectionEnd,
        selectionWidth,
        selectionLeft
      },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            order: true
          }
        }
      }
    })

    console.log("[BOOKMARKS_POST] Created bookmark:", bookmark.id)
    return NextResponse.json(bookmark)
  } catch (error) {
    console.error("[BOOKMARKS_POST] Error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 