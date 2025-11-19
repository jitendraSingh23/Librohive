"use client"

import type React from "react"
import { BookOpen } from "lucide-react"

import LoginComp from "@/components/auth/LoginComp"
import Image from "next/image"
import manpng from "@/public/img/manVector.png"
export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-sepia" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <BookOpen className="mr-2 h-6 w-6" />
          LibroHive
        </div>
        <div className="z-20 flex justify-center items-center mt-20 ">
          <Image src={manpng} alt="LibroHive" width={400} height={400} />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">`Reading is essential for those who seek to rise above the ordinary.`</p>
            <footer className="text-sm">Jim Rohn</footer>
          </blockquote>
        </div>
      </div>
      <LoginComp/>
     
    </div>
  )
}

