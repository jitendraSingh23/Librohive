import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { chapterId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { progress } = await request.json()
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: 'Invalid progress value' },
        { status: 400 }
      )
    }

    // Get the chapter to verify it exists and get its bookId
    const chapter = await prisma.chapter.findUnique({
      where: { id: params.chapterId },
      select: {
        id: true,
        bookId: true,
        readingProgress: {
          where: { userId: session.user.id }
        }
      }
    })

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }

    // Update or create reading progress
    const updatedProgress = await prisma.readingProgress.upsert({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId: params.chapterId
        }
      },
      create: {
        userId: session.user.id,
        chapterId: params.chapterId,
        bookId: chapter.bookId,
        progress
      },
      update: {
        progress
      },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            order: true,
            readingProgress: {
              where: { userId: session.user.id }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedProgress.chapter)
  } catch (error) {
    console.error('Error updating reading progress:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 