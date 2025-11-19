import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { chapterId: string; commentId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if comment exists
    const comment = await db.comment.findUnique({
      where: {
        id: params.commentId,
      },
    })

    if (!comment) {
      return new NextResponse("Comment not found", { status: 404 })
    }

    // Check if user has already liked the comment
    const existingLike = await db.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: params.commentId,
        },
      },
    })

    if (existingLike) {
      // Unlike the comment
      await db.commentLike.delete({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId: params.commentId,
          },
        },
      })
    } else {
      // Like the comment
      await db.commentLike.create({
        data: {
          userId: session.user.id,
          commentId: params.commentId,
        },
      })
    }

    // Fetch the updated comment with counts
    const updatedComment = await db.comment.findUnique({
      where: {
        id: params.commentId,
      },
      include: {
        user: true,
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    })

    if (!updatedComment) {
      return new NextResponse("Comment not found", { status: 404 })
    }

    // Check if the current user has liked the comment
    const isLiked = await db.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: params.commentId,
        },
      },
    })

    return NextResponse.json({
      ...updatedComment,
      isLiked: !!isLiked,
    })
  } catch (error) {
    console.error("[COMMENT_LIKE_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 