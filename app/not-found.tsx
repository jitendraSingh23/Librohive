// pages/404.tsx
import Link from "next/link";

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl mt-4 text-muted-foreground">Oops! Page not found.</p>
      <Link href="/">
        <button className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80">
          Go Home
        </button>
      </Link>
    </div>
  );
}
