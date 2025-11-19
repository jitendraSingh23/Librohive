import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { type Comment } from "@/components/chapter-reader/types"

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

export async function GET(
  req: Request,
  { params }: { params: { chapterId: string } }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    // Fetch top-level comments with their replies recursively
    const comments = await db.comment.findMany({
      where: {
        chapterId: params.chapterId,
        parentId: null, // Only fetch top-level comments
      },
      include: {
        user: true,
        likes: true,
        replies: {
          include: {
            user: true,
            likes: true,
            replies: {
              include: {
                user: true,
                likes: true,
                replies: {
                  include: {
                    user: true,
                    likes: true,
                    replies: {
                      include: {
                        user: true,
                        likes: true,
                        _count: {
                          select: {
                            likes: true,
                            replies: true,
                          },
                        },
                      },
                    },
                    _count: {
                      select: {
                        likes: true,
                        replies: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    likes: true,
                    replies: true,
                  },
                },
              },
            },
            _count: {
              select: {
                likes: true,
                replies: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Add isLiked flag for each comment and its replies recursively
    const addIsLikedFlag = async (comment: any): Promise<CommentWithReplies> => {
      const isLiked = userId
        ? await db.commentLike.findUnique({
            where: {
              userId_commentId: {
                userId,
                commentId: comment.id,
              },
            },
          })
        : null

      const commentWithLike = {
        ...comment,
        isLiked: !!isLiked,
      }

      if (comment.replies && comment.replies.length > 0) {
        commentWithLike.replies = await Promise.all(
          comment.replies.map(reply => addIsLikedFlag(reply))
        )
      }

      return commentWithLike
    }

    const commentsWithLikes = await Promise.all(
      comments.map(comment => addIsLikedFlag(comment))
    )

    return NextResponse.json(commentsWithLikes)
  } catch (error) {
    console.error("[COMMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { chapterId: string } }
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

    // Get the chapter to find its bookId
    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
      },
      select: {
        bookId: true,
      },
    })

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 })
    }

    // First verify that the user exists
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      // Try to create the user if they don't exist
      try {
        await db.user.create({
          data: {
            id: session.user.id,
            email: session.user.email || null,
            name: session.user.name || null,
            image: session.user.image || null,
          }
        })
      } catch (error) {
        console.error('Failed to create user:', error)
        return new NextResponse("Failed to create user", { status: 500 })
      }
    }

    const comment = await db.comment.create({
      data: {
        content,
        userId: session.user.id,
        chapterId: params.chapterId,
        bookId: chapter.bookId,
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
      ...comment,
      isLiked: false,
    })
  } catch (error) {
    console.error("[COMMENTS_POST]", error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
} 