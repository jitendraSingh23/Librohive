import { getBooks } from '@/lib/books';
import BooksClient from './BooksClient';

export default async function BooksPage() {
  const books = await getBooks();

  return <BooksClient initialBooks={books} />;
}