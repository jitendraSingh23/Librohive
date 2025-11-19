import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: { chapterId: string; commentId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if comment exists and belongs to the user
    const comment = await db.comment.findUnique({
      where: {
        id: params.commentId,
      },
      select: {
        userId: true,
      },
    })

    if (!comment) {
      return new NextResponse("Comment not found", { status: 404 })
    }

    if (comment.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // First, delete all likes for the comment and its replies
    await db.commentLike.deleteMany({
      where: {
        commentId: params.commentId,
      },
    })

    // Then delete the comment and all its replies
    await db.comment.deleteMany({
      where: {
        OR: [
          { id: params.commentId },
          { parentId: params.commentId },
        ],
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[COMMENT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 