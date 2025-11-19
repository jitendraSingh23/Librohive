import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const users = await db.user.findMany({
      take: 4,
      orderBy: [
        {
          followers: {
            _count: 'desc'
          }
        }
      ],
      select: {
        id: true,
        name: true,
        image: true,
        _count: {
          select: {
            followers: true,
            books: true
          }
        }
      }
    });

    if (!users || !Array.isArray(users)) {
      return NextResponse.json([], { status: 200 });
    }

    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'Unknown User',
      image: user.image,
      _count: {
        followers: user._count?.followers || 0,
        books: user._count?.books || 0
      }
    }));

    return NextResponse.json(transformedUsers);

  } catch (error) {
    console.error('Error in featured-authors:', error);
    return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 });
  }
}