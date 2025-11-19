import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const targetUserId = params.userId;
    const currentUserId = session.user.id;

    // Don't allow checking follow status for yourself
    if (targetUserId === currentUserId) {
      return new NextResponse('Cannot check follow status for yourself', { status: 400 });
    }

    // Check if following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    return NextResponse.json({ isFollowing: !!existingFollow });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 