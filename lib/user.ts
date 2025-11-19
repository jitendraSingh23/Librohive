import { db } from "@/lib/db"

export async function isFollowingUser(followerId: string, followingId: string) {
  if (!followerId || !followingId) return false

  const follow = await db.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId
      }
    }
  })

  return !!follow
}

export async function getFollowCounts(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      _count: {
        select: {
          followers: true,
          following: true
        }
      }
    }
  })

  return {
    followersCount: user?._count.followers ?? 0,
    followingCount: user?._count.following ?? 0
  }
}