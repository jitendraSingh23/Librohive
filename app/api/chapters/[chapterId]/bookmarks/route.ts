import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { chapterId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { chapterId } = await params
    const bookmarks = await db.bookmark.findMany({
      where: {
        chapterId,
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error("[BOOKMARKS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { chapterId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { chapterId } = await params
    const body = await req.json()
    const { position, note, selectedText } = body

    // Get the chapter to find its bookId
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      select: { bookId: true }
    })

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 })
    }

    const bookmark = await db.bookmark.create({
      data: {
        position,
        note,
        selectedText,
        chapterId,
        bookId: chapter.bookId,
        userId: session.user.id,
      }
    })

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error("[BOOKMARKS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 