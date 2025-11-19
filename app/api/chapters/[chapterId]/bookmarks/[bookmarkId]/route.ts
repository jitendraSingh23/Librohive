import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: { chapterId: string; bookmarkId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if bookmark exists and belongs to the user
    const bookmark = await db.bookmark.findUnique({
      where: {
        id: params.bookmarkId,
      },
      select: {
        userId: true,
      },
    })

    if (!bookmark) {
      return new NextResponse("Bookmark not found", { status: 404 })
    }

    if (bookmark.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await db.bookmark.delete({
      where: {
        id: params.bookmarkId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[BOOKMARK_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 