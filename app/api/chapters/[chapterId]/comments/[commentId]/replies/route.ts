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

    const body = await req.json()
    const { content } = body

    if (!content) {
      return new NextResponse("Content is required", { status: 400 })
    }

    // Get the parent comment to find its bookId
    const parentComment = await db.comment.findUnique({
      where: {
        id: params.commentId,
      },
      select: {
        bookId: true,
      },
    })

    if (!parentComment) {
      return new NextResponse("Parent comment not found", { status: 404 })
    }

    // Create the reply
    const reply = await db.comment.create({
      data: {
        content,
        userId: session.user.id,
        chapterId: params.chapterId,
        bookId: parentComment.bookId,
        parentId: params.commentId,
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

    return NextResponse.json({
      ...reply,
      isLiked: false,
    })
  } catch (error) {
    console.error("[COMMENT_REPLY_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 