import { useState, useEffect } from "react"
import { Star, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface RatingSectionProps {
  bookId: string
  userRating?: number
}

export function RatingSection({
  bookId,
  userRating
}: RatingSectionProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [rating, setRating] = useState(userRating || 0)
  const [selectedRating, setSelectedRating] = useState(userRating || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  useEffect(() => {
    setRating(userRating || 0)
    setSelectedRating(userRating || 0)
  }, [userRating])

  const handleRatingSelect = (value: number) => {
    setSelectedRating(value)
  }

  const handleRatingSubmit = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rate this book",
        variant: "destructive",
      })
      return
    }

    if (selectedRating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/books/${bookId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating: selectedRating })
      })

      if (response.ok) {
        const data = await response.json()
        setRating(data.userRating)
        toast({
          title: "Rating updated",
          description: "Your rating has been saved successfully",
        })
      }
    } catch (error) {
      console.error('Error updating rating:', error)
      toast({
        title: "Error",
        description: "Failed to update rating",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader className="pb-4 px-6">
        <CardTitle className="text-xl font-semibold">Rate this Book</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between bg-muted/30 rounded-lg px-6 py-5">
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "p-1 h-auto hover:bg-transparent transition-colors duration-200",
                    (star <= (hoverRating || selectedRating)) && "text-yellow-400",
                    !(star <= (hoverRating || selectedRating)) && "text-muted-foreground/40",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleRatingSelect(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  disabled={isLoading}
                >
                  <Star className="h-8 w-8 fill-current" />
                </Button>
              ))}
            </div>
            {session?.user && selectedRating > 0 && selectedRating !== rating && (
              <Button
                size="sm"
                variant="secondary"
                className="h-10 px-5 ml-6"
                onClick={handleRatingSubmit}
                disabled={isLoading}
              >
                <Send className="h-4 w-4 mr-2" />
                Post Rating
              </Button>
            )}
          </div>
          
          {!session?.user && (
            <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-6 py-5">
              Sign in to rate this book
            </p>
          )}

          {session?.user && rating > 0 && (
            <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-6 py-5">
              Your current rating: {rating} stars
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 