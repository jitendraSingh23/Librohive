import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; bookmarkId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if bookmark exists and belongs to the user
    const bookmark = await db.bookmark.findUnique({
      where: {
        id: params.bookmarkId,
      },
      select: {
        userId: true,
        bookId: true,
      },
    })

    if (!bookmark) {
      return NextResponse.json(
        { message: "Bookmark not found" },
        { status: 404 }
      )
    }

    if (bookmark.userId !== session.user.id || bookmark.bookId !== params.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    await db.bookmark.delete({
      where: {
        id: params.bookmarkId,
      },
    })

    return NextResponse.json({ message: "Bookmark deleted" })
  } catch (error) {
    console.error("[BOOKMARK_DELETE]", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 