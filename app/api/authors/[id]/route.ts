import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const author = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      include: {
        books: {
          where: {
            published: true
          },
          include: {
            chapters: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        followers: {
          include: {
            follower: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          }
        }
      },
    })

    if (!author) {
      return new NextResponse("Author not found", { status: 404 })
    }

    return NextResponse.json({
      id: author.id,
      name: author.name,
      image: author.image,
      bio: author.bio,
      books: author.books,
      followers: author.followers.map(follow => follow.follower),
      createdAt: author.createdAt,
    })
  } catch (error) {
    console.error("[AUTHOR_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 