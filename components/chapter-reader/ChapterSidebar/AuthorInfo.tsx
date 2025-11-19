import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { type AuthorInfoProps } from "../types"

export function AuthorInfo({ author, authorData }: AuthorInfoProps) {
  const booksCount = authorData?.books?.length ?? 0
  const followersCount = authorData?.followers?.length ?? 0

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6">
      <h3 className="font-semibold mb-4">About the Author</h3>
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={author.image || ""} alt={author.name || ""} />
          <AvatarFallback>{author.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium">{author.name}</h4>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-1">
            <span>{booksCount} books</span>
            <span>{followersCount} followers</span>
          </div>
        </div>
      </div>
      <Button variant="outline" className="w-full" asChild>
        <Link href={`/authors/${author.id}`}>
          View Profile
        </Link>
      </Button>
    </div>
  )
} 