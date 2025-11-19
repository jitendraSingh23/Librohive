"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  rating: number | null
  userRating?: number | null
  size?: "default" | "sm" | "lg"
  readonly?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function RatingStars({
  rating,
  userRating,
  size = "default",
  readonly = false,
  onChange,
  className
}: RatingStarsProps) {
  // Return early with empty stars if no rating
  if (rating === null) {
    return (
      <div className={cn("flex items-center gap-0.5", className)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              size === "sm" ? "h-3 w-3" : "h-4 w-4",
              "text-muted-foreground/40"
            )}
          />
        ))}
      </div>
    );
  }

  const stars = [1, 2, 3, 4, 5]

  const sizeClasses = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5"
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          className={cn(
            "focus:outline-none",
            !readonly && "hover:scale-110 transition"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors",
              {
                "text-yellow-400 fill-yellow-400": rating >= star,
                "text-muted-foreground": rating < star,
                "!text-primary !fill-primary": userRating === star
              }
            )}
          />
        </button>
      ))}
    </div>
  )
}