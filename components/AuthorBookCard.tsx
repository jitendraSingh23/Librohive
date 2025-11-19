'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AuthorBookCardProps {
  book: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    tags: string[];
    chapters: Array<{
      id: string;
      title: string;
      order: number;
    }>;
    readingProgress: Array<{
      progress: number;
    }>;
  };
  currentUserId: string | undefined;
}

export function AuthorBookCard({ book, currentUserId }: AuthorBookCardProps) {
  const progress = book.readingProgress[0]?.progress || 0;

  return (
    <Link href={`/books/${book.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow max-w-[200px]">
        <div className="relative aspect-[4/3]">
          <Image
            src={book.thumbnail || '/images/placeholder-book.jpg'}
            alt={book.title}
            fill
            className="object-cover rounded-t-lg"
          />
        </div>
        <CardContent className="p-2">
          <h3 className="font-semibold text-sm mb-0.5 line-clamp-1">{book.title}</h3>
          <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{book.description}</p>
          <div className="flex flex-wrap gap-0.5 mb-1">
            {book.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {book.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{book.tags.length - 2}
              </Badge>
            )}
          </div>
          {currentUserId && (
            <div className="space-y-0.5">
              <Progress value={progress} className="h-1" />
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-2 pt-0">
          <div className="w-full">
            <div className="text-xs text-muted-foreground">
              {book.chapters.length} chapters
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
} 