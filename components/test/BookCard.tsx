// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Star, Bookmark, BookOpen } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { type BookWithDetails } from "@/lib/books";
// import { useSession } from "next-auth/react";
// import { toast } from "sonner";

// interface BookCardProps {
//   book: BookWithDetails;
// }

// export default function BookCard({ book }: BookCardProps) {
//   const { data: session } = useSession();
//   const [isSaved, setIsSaved] = useState(false);

//   const handleSave = async () => {
//     if (!session?.user) {
//       toast.error("Please login to save books");
//       return;
//     }

//     try {
//       const response = await fetch(`/api/books/${book.id}/saves`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to save book");
//       }

//       setIsSaved(!isSaved);
//       toast.success(isSaved ? "Book removed from saved" : "Book saved successfully");
//     } catch (error) {
//       console.error("Error saving book:", error);
//       toast.error("Failed to save book");
//     }
//   };

//   return (
//     <div className="group relative flex flex-col bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-200 h-[360px] w-full max-w-[300px]">
//       {/* Cover Image */}
//       <Link href={`/books/${book.id}`} className="relative h-[200px] w-full overflow-hidden rounded-t-lg">
//         {book.coverImage ? (
//           <Image
//             src={book.coverImage}
//             alt={book.title}
//             fill
//             className="object-cover transition-transform duration-200 group-hover:scale-105"
//           />
//         ) : (
//           <div className="flex h-full items-center justify-center bg-muted">
//             <BookOpen className="h-12 w-12 text-muted-foreground" />
//           </div>
//         )}
//       </Link>

//       {/* Content */}
//       <div className="flex flex-col flex-1 p-4">
//         {/* Title and Author */}
//         <div className="mb-2">
//           <Link href={`/books/${book.id}`} className="block">
//             <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors text-base">
//               {book.title}
//             </h3>
//           </Link>
//           <Link href={`/profile/${book.author.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
//             {book.author.name}
//           </Link>
//         </div>

//         {/* Rating */}
//         <div className="flex items-center gap-1.5 mb-2">
//           <div className="flex items-center">
//             {[...Array(5)].map((_, i) => (
//               <Star
//                 key={i}
//                 className={`h-3.5 w-3.5 ${
//                   i < Math.floor(book.rating)
//                     ? 'text-yellow-400 fill-current'
//                     : 'text-gray-300'
//                 }`}
//               />
//             ))}
//           </div>
//           <span className="text-sm text-muted-foreground">
//             {book.rating.toFixed(1)} ({book.totalRatings})
//           </span>
//         </div>

//         {/* Tags */}
//         {book.tags && book.tags.length > 0 && (
//           <div className="flex flex-wrap gap-1 mb-2 min-h-[24px]">
//             {book.tags.slice(0, 2).map((tag) => (
//               <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
//                 {tag}
//               </Badge>
//             ))}
//             {book.tags.length > 2 && (
//               <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
//                 +{book.tags.length - 2}
//               </Badge>
//             )}
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="flex items-center justify-between mt-auto">
//           <Link href={`/books/${book.id}`} className="flex-1">
//             <Button variant="outline" size="sm" className="w-full h-8">
//               Read Now
//             </Button>
//           </Link>
//           <Button
//             variant="ghost"
//             size="sm"
//             className="ml-2 h-8 w-8 p-0"
//             onClick={handleSave}
//           >
//             <Bookmark
//               className={`h-4 w-4 ${
//                 isSaved ? "fill-current text-primary" : "text-muted-foreground"
//               }`}
//             />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
