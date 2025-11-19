"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, BookOpen, MoreVertical, Edit, Trash2, Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type BookWithDetails } from "@/lib/books";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RatingStars } from "@/components/rating/rating-stars";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { BookComments } from "@/components/book-comments";

interface BookCardProps {
  book: BookWithDetails & { 
    published?: boolean; 
    progress?: number;
    userRating?: number | null;
    ratings: Array<{
      id: string;
      value: number;
      userId: string;
    }>;
    _count: {
      ratings: number;
      likes: number;
      comments: number;
    };
  };
  variant?: "default" | "manageable" | "compact";
  className?: string;
  onDelete?: (bookId: string) => Promise<void>;
  onPublish?: (bookId: string) => Promise<void>;
}

export function BookCard({ book, variant = "default", className, onDelete, onPublish }: BookCardProps) {
  
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [saves, setSaves] = useState(book.saves || []);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Check if the book is saved by the current user
  const isSaved = session?.user && saves.some(save => save.userId === session.user.id);

  const averageRating = useMemo(() => {
    if (!book?.ratings?.length) return null;
    return Math.round((book.ratings.reduce((acc, curr) => acc + curr.value, 0) / book.ratings.length) * 2) / 2;
  }, [book?.ratings]);

  const handleSave = async () => {
    if (!session?.user) {
      toast.error("Please login to save books");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/books/${book.id}/saves`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to save book");
      }

      const data = await response.json();
      
      // Update the saves state
      if (data.isSaved) {
        // Add the save to the saves array
        setSaves(prevSaves => [...prevSaves, {
          id: data.saveId,
          userId: session.user.id,
          bookId: book.id,
          createdAt: new Date()
        }]);
      } else {
        // Remove the save from the saves array
        setSaves(prevSaves => prevSaves.filter(save => save.userId !== session.user.id));
      }

      toast.success(data.isSaved ? "Book saved successfully" : "Book removed from saved");
    } catch (error) {
      console.error("Error saving book:", error);
      toast.error("Failed to save book");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsLoading(true);
    try {
      await onDelete(book.id);
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book");
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handlePublish = async () => {
    if (!onPublish) return;
    setIsLoading(true);
    try {
      await onPublish(book.id);
      toast.success(book.published ? "Book unpublished" : "Book published successfully");
    } catch (error) {
      console.error("Error publishing book:", error);
      toast.error("Failed to update book status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeComment = (commentId: string) => {
    // Implement the logic for liking a comment
  };

  return (
    <div className={cn(
      "group relative flex flex-col bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-200  w-full max-w-[300px]",
      variant === "compact" && "h-[320px] max-w-[260px]",
      className
    )}>
      {/* Management Options for Manageable variant */}
      {variant === "manageable" && (
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/upload/writebook?edit=${book.id}`} className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePublish} disabled={isLoading}>
                {book.published ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                disabled={isLoading}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your book
              and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Comments Dialog */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <BookComments 
            comments={book.comments || []}
            onLikeComment={handleLikeComment}
          />
        </DialogContent>
      </Dialog>

      {/* Cover Image */}
      <Link href={`/books/${book.id}`} className="relative h-[400px] w-full overflow-hidden rounded-t-lg">
        {book.coverImage ? (
          <Image
            src={book.coverImage}
            alt={book.title}
            fill
            sizes="(max-width: 300px) 100vw, 300px"
            priority={variant === "default"}
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title and Author */}
        <div className="mb-2">
          <Link href={`/books/${book.id}`} className="block">
            <h3 className={cn(
              "font-semibold hover:text-primary transition-colors",
              variant === "compact" ? "text-sm line-clamp-1" : "text-base line-clamp-2"
            )}>
              {book.title}
            </h3>
          </Link>
          <Link 
            href={`/profile/${book.author.id}`} 
            className={cn(
              "text-muted-foreground hover:text-primary transition-colors",
              variant === "compact" ? "text-xs" : "text-sm"
            )}
          >
            {book.author.name}
          </Link>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <RatingStars 
            rating={averageRating ?? 0}
            userRating={book?.userRating ?? null}
            size={variant === "compact" ? "sm" : "default"}
            readonly
          />
          <span className={cn(
            "text-muted-foreground",
            variant === "compact" ? "text-xs" : "text-sm"
          )}>
            {averageRating 
              ? `${averageRating.toFixed(1)} (${book?._count?.ratings ?? 0})`
              : "No ratings"
            }
          </span>
        </div>

        {/* Tags */}
        {book.tags && book.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2 min-h-[24px]">
            {book.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {book.tags.length > 2 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                +{book.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-auto">
          <Link href={`/books/${book.id}`} className="flex-1">
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "w-full",
                variant === "compact" ? "h-7 text-xs" : "h-8 text-sm"
              )}
            >
              Read Now
            </Button>
          </Link>
          {variant !== "manageable" && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "ml-2",
                variant === "compact" ? "h-7 w-7" : "h-8 w-8"
              )}
              onClick={handleSave}
              disabled={isLoading}
            >
              <Bookmark
                className={cn(
                  variant === "compact" ? "h-3.5 w-3.5" : "h-4 w-4",
                  isSaved ? "fill-current text-primary" : "text-muted-foreground"
                )}
              />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}