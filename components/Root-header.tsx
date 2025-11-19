"use client";

import { useState } from "react";
import {  Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import Image from "next/image";
import logo from "../public/img/LibroHivelogo.svg";
import LoginButton from "./auth/login-button";

export default function RootHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-accent-foreground px-4 md:px-10">
      <div className="container flex h-16 items-center justify-between py-4">
        {/* Left Side - Logo */}
        <div className="flex items-center gap-2">
          <Image src={logo} alt="librohive" width={130} height={40} />
        </div>

        {/* Desktop Navigation (Hidden on Small Screens) */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/discover" className="text-sm font-medium hover:underline">
            Discover
          </Link>
          <Link href="/library" className="text-sm font-medium hover:underline">
            My Library
          </Link>
          <Link href="/write" className="text-sm font-medium hover:underline">
            Write
          </Link>
          
        </nav>

        {/* Right Side - Search, Theme Toggle, Sign In, and Hamburger */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LoginButton mode="modal">

          <Button size="sm">Sign In</Button>
          </LoginButton>

          {/* Hamburger Icon (Visible on Mobile) */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-accent-foreground shadow-md border-b">
          <nav className="flex flex-col items-center gap-4 py-4">
            <Link href="/discover" className="text-sm font-medium hover:underline">
              Discover
            </Link>
            <Link href="/library" className="text-sm font-medium hover:underline">
              My Library
            </Link>
            <Link href="/write" className="text-sm font-medium hover:underline">
              Write
            </Link>
            <Link href="/pdfs" className="text-sm font-medium hover:underline">
              PDFs
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
