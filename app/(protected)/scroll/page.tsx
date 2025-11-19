import { Suspense } from "react"
import { ScrollFeed } from "@/components/scroll-feed"
import { ScrollSkeleton } from "@/components/scroll-skeleton"

export default function ScrollPage() {
  return (
    <div className=" items-center container max-w-screen  py-6 bg-accent-foreground">
      <Suspense fallback={<ScrollSkeleton />}>
        <ScrollFeed />
      </Suspense>
    </div>
  )
}