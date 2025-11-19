import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

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

    const { chapterId, progress } = await req.json()

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

    // Verify the chapter belongs to this book
    const chapter = await db.chapter.findFirst({
      where: {
        id: chapterId,
        bookId: book.id
      }
    })

    if (!chapter) {
      return NextResponse.json(
        { message: "Chapter not found or does not belong to this book" },
        { status: 404 }
      )
    }

    // Update the reading progress
    const updatedProgress = await db.readingProgress.upsert({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId: chapterId,
        },
      },
      update: {
        progress: progress,
      },
      create: {
        userId: session.user.id,
        chapterId: chapterId,
        bookId: book.id,
        progress: progress,
      },
    })

    return NextResponse.json(updatedProgress)
  } catch (error) {
    console.error("[READING_PROGRESS_POST]", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

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
      where: { id: params.id },
      include: {
        chapters: {
          select: {
            id: true,
            order: true,
            readingProgress: {
              where: {
                userId: session.user.id
              }
            }
          }
        }
      }
    })

    if (!book) {
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      )
    }

    // Calculate overall book progress
    const totalChapters = book.chapters.length
    const completedChapters = book.chapters.filter(chapter => 
      chapter.readingProgress.some(progress => progress.progress === 100)
    ).length

    const progress = totalChapters > 0 
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0

    // Format chapter progress
    const chapterProgress = book.chapters.map(chapter => ({
      chapterId: chapter.id,
      order: chapter.order,
      progress: chapter.readingProgress[0]?.progress || 0
    }))

    return NextResponse.json({
      bookId: book.id,
      progress,
      chapters: chapterProgress
    })
  } catch (error) {
    console.error("[READING_PROGRESS_GET]", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 