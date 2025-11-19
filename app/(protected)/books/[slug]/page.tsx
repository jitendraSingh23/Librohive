import { getBook } from '@/lib/books';
import { notFound } from 'next/navigation';
// import Image from 'next/image';
// import Link from 'next/link';
import { auth } from '@/auth';
import BookDetails from '@/components/test/BookDetails';

export default async function BookPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  const userId = session?.user?.id;
  
  console.log('BookPage: Fetching book with slug:', params.slug, 'userId:', userId);
  
  const book = await getBook(params.slug, userId);
  
  if (!book) {
    console.log('BookPage: Book not found');
    notFound();
  }

  console.log('BookPage: Found book:', {
    title: book.title,
    chaptersCount: book.chapters.length,
    hasReadingProgress: book.chapters.some(chapter => chapter.readingProgress?.length > 0)
  });

  return <BookDetails book={book} />;
}