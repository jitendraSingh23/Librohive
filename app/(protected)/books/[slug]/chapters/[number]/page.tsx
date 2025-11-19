import { getBook, getChapter } from '@/lib/books';
import { notFound } from 'next/navigation';
// import Link from 'next/link';
import { auth } from '@/auth';
import {ChapterReader} from '@/components/chapter-reader/ChapterReader';

export default async function ChapterPage({ 
  params 
}: { 
  params: { slug: string; number: string } 
}) {
  const session = await auth();
  const userId = session?.user?.id;
  
  const book = await getBook(params.slug, userId);
  
  if (!book) {
    notFound();
  }
  
  const chapterNumber = parseInt(params.number, 10);
  if (isNaN(chapterNumber)) {
    notFound();
  }
  
  const chapter = await getChapter(book.id, chapterNumber, userId);
  
  if (!chapter) {
    notFound();
  }

  return <ChapterReader book={book} chapter={chapter} />;
}