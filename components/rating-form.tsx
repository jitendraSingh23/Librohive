"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface RatingFormProps {
  bookId: string
}

export function RatingForm({ bookId }: RatingFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, rating }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit rating")
      }

      toast.success("Rating submitted successfully")
    } catch (error) {
      toast.error("Failed to submit rating")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Rate this Book</h3>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none"
          >
            <Star
              className={`h-8 w-8 ${
                (hoveredRating || rating) >= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      <Button 
        type="submit" 
        disabled={!rating || isLoading}
        className="w-full"
      >
        {isLoading ? "Submitting..." : "Submit Rating"}
      </Button>
    </form>
  )
}