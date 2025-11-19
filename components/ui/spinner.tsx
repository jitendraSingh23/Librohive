import React from 'react'
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Loader2 
      className={cn("h-6 w-6 animate-spin", className)} 
      {...props} 
    />
  )
}