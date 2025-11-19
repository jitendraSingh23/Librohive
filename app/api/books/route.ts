import { getBooks } from '@/lib/books';
import { NextResponse } from 'next/server';
// import { auth } from '@/auth';

export async function GET() {
  try {
    const books = await getBooks();
    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}