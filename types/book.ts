import { Book, Comment, Chapter } from "@prisma/client"

export interface BookWithDetails {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  tags: string[];
  published: boolean;
  authorId: string;
  createdAt?: Date;
  updatedAt?: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    avatar?: string; // For UI purposes
    bio?: string;
    books: number;
    followers?: string;
  };
  chapters: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
    progress?: number;
    number?: number; // For UI purposes
  }>;
  publishDate?: string;
  readTime?: string;
  rating?: number;
  progress?: number;
  totalChapters?: number;
  coverUrl?: string;
}

export interface ChapterWithBook extends Chapter {
  book: Book
}

export interface FormattedChapter extends Chapter {
  number: number;
  progress: number;
  comments?: CommentWithUser[];
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  likes: number;
  replies?: CommentWithUser[];
}

export interface FormattedBook extends Omit<Book, 'chapters'> {
  publishDate: string;
  readTime: string;
  rating: number;
  progress: number;
  totalChapters: number;
  chapters: FormattedChapter[];
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  comments?: CommentWithUser[];
  bookmarks?: number;
  totalRatings: number;
  userRating?: number;
  isBookmarked?: boolean;
}

export interface CustomChapter {
  id: string;
  title: string;
  content: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  progress?: number;
  number?: number;
}