import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const targetUserId = params.userId;

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      await db.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });

      // Get updated followers count
      const updatedFollowers = await db.follow.count({
        where: {
          followingId: targetUserId,
        },
      });

      return NextResponse.json({
        message: 'Unfollowed successfully',
        isFollowing: false,
        followersCount: updatedFollowers
      });
    } else {
      await db.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      });

      // Get updated followers count
      const updatedFollowers = await db.follow.count({
        where: {
          followingId: targetUserId,
        },
      });

      return NextResponse.json({
        message: 'Followed successfully',
        isFollowing: true,
        followersCount: updatedFollowers
      });
    }
  } catch (error) {
    console.error('Error in follow/unfollow:', error);
    return NextResponse.json(
      { error: 'Failed to process follow/unfollow request' },
      { status: 500 }
    );
  }
}