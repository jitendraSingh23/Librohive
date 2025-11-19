import { type Book as PrismaBook, type Chapter as PrismaChapter, type Comment as PrismaComment } from '@prisma/client'

export interface ChapterReaderProps {
  book: PrismaBook & {
    author: {
      id: string;
      name: string;
      image: string | null;
    };
    chapters: Array<PrismaChapter & {
      readingProgress: Array<{
        progress: number;
      }>;
    }>;
    likes: Array<{
      id: string;
      userId: string;
      bookId: string;
      createdAt: Date;
    }>;
    userRating?: number;
    rating: number;
    totalRatings: number;
    views: number;
  }
  chapter: PrismaChapter & {
    readingProgress: Array<{
      progress: number;
    }>;
  }
  user?: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
}

export interface Bookmark {
  id: string;
  position: number;
  selectedText: string;
  note?: string;
  createdAt: Date;
  chapterId: string;
  selectionStart: number;
  selectionEnd: number;
  selectionWidth: number;
  selectionLeft: number;
}

export interface AuthorData {
  books: Array<{
    id: string;
    title: string;
    coverImage: string;
    description: string;
    createdAt: Date;
  }>;
  followers: Array<{
    id: string;
    name: string;
    image: string | null;
  }>;
}

export interface CommentWithUser extends Omit<PrismaComment, 'user'> {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  likes: Array<{ userId: string }>;
}

export interface BookInfoProps {
  book: ChapterReaderProps['book'];
}

export interface BookmarkSectionProps {
  session: {
    user?: {
      id: string;
      name?: string | null;
      image?: string | null;
    }
  } | null;
  bookmarks: Bookmark[];
  onAddBookmark: (note: string) => void;
  onDeleteBookmark: (id: string) => void;
  book: {
    id: string;
    chapters: Array<{
      id: string;
      title: string;
      order: number;
    }>;
  };
  currentChapterId: string;
}

export interface ChaptersListProps {
  book: ChapterReaderProps['book'];
  currentChapter: ChapterReaderProps['chapter'];
  bookmarks: Bookmark[];
  onBookmarkClick: (position: number) => void;
  onDeleteBookmark: (id: string) => void;
}

export interface AuthorInfoProps {
  author: ChapterReaderProps['book']['author'];
  authorData: AuthorData;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  parentId: string | null;
  likes?: { userId: string }[];
  replies?: Comment[];
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  isLiked?: boolean;
  _count?: {
    likes: number;
    replies: number;
  };
}

export interface CommentsSectionProps {
  chapterId: string;
  comments: Comment[];
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
  } | undefined;
  session: {
    user?: {
      id: string;
      name?: string | null;
      image?: string | null;
    }
  } | null;
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
}

export interface BookChapterHeaderProps {
  bookTitle: string;
  bookId: string;
  isFullscreen: boolean;
  isLiked: boolean;
  isSaved: boolean;
  likeCount: number;
  viewCount: number;
  isLoading: boolean;
  onToggleFullscreen: () => void;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onShare: () => void;
}

export interface ChapterContentProps {
  chapter: {
    id: string;
    title: string;
    content: string;
    order: number;
    progress: number;
    bookId: string;
    createdAt: Date;
    updatedAt: Date;
    readingProgress: Array<{
      progress: number;
    }>;
  };
  book: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    tags: string[];
    published: boolean;
    authorId: string;
    rating: number;
    totalRatings: number;
    views: number;
    readTime: string | null;
    userRating?: number;
  };
  isFirstChapter: boolean;
  isLastChapter: boolean;
  prevChapter?: {
    id: string;
    title: string;
    order: number;
    readingProgress: Array<{
      progress: number;
    }>;
  };
  nextChapter?: {
    id: string;
    title: string;
    order: number;
    readingProgress: Array<{
      progress: number;
    }>;
  };
} 