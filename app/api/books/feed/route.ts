import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 10
    const skip = (page - 1) * limit

    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const books = await db.book.findMany({
      take: limit,
      skip,
      where: {
        published: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        likes: {
          where: {
            userId: session.user.id
          }
        },
        bookmarks: {
          where: {
            userId: session.user.id
          }
        },
        saves: {
          where: {
            userId: session.user.id
          }
        },
        ratings: {
          select: {
            value: true,
            userId: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            _count: {
              select: {
                likes: true,
                replies: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true
                  }
                },
                _count: {
                  select: {
                    likes: true,
                    replies: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            ratings: true,
            bookmarks: true
          }
        }
      }
    })

    const transformedBooks = books.map(book => {
      const ratings = book.ratings || [];
      const hasRatings = ratings.length > 0;

      return {
        ...book,
        isLiked: book.likes.length > 0,
        isBookmarked: book.bookmarks.length > 0,
        isSaved: book.saves.length > 0,
        userRating: hasRatings ? ratings.find(r => r.userId === session.user.id)?.value || null : null,
        averageRating: hasRatings 
          ? Math.round((ratings.reduce((acc, curr) => acc + curr.value, 0) / ratings.length) * 2) / 2
          : null,
        likes: undefined,
        bookmarks: undefined,
        saves: undefined,
        ratings: undefined
      };
    });

    return NextResponse.json(transformedBooks);
  } catch (error) {
    console.error("[BOOKS_FEED]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}