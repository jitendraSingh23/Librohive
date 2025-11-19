// "use client"

// import { useState, useEffect } from "react"
// import Link from "next/link"
// import Image from "next/image"
// import { useSession } from "next-auth/react"
// import { type Comment } from '@prisma/client'
// import { 
//   ArrowLeft, 
//   Bookmark, 
//   ChevronLeft, 
//   ChevronRight, 
//   Heart, 
//   Maximize, 
//   Minimize, 
//   Share2, 
//   Send,
//   Loader2,
//   BookmarkIcon,
//   Trash2
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Textarea } from "@/components/ui/textarea"
// import { useToast } from "@/components/ui/use-toast"
// import { CommentList } from "@/components/comments/CommentList"

// interface ChapterReaderProps {
//   book: {
//     id: string;
//     title: string;
//     description: string;
//     thumbnail: string | null;
//     tags: string[];
//     published: boolean;
//     authorId: string;
//     rating: number;
//     totalRatings: number;
//     views: number;
//     readTime: string | null;
//     progress: number;
//     author: {
//       id: string;
//       name: string | null;
//       image: string | null;
//       books?: Array<{ id: string }>;
//       followers?: Array<{ id: string }>;
//     };
//     chapters: Array<{
//       id: string;
//       title: string;
//       content: string;
//       order: number;
//       progress: number;
//     }>;
//   }
//   chapter: {
//     id: string;
//     title: string;
//     content: string;
//     order: number;
//     progress: number;
//     comments?: Comment[];
//   }
//   user?: {
//     id: string;
//     name?: string | null;
//     image?: string | null;
//   };
// }

// interface Bookmark {
//   id: string;
//   position: number;
//   note?: string | null;
//   selectedText?: string | null;
//   createdAt: Date;
//   chapterId: string;
//   selectionStart: number;
//   selectionEnd: number;
//   selectionWidth: number;
//   selectionLeft: number;
// }

// export default function ChapterReader({ book, chapter: initialChapter }: ChapterReaderProps) {
//   const { data: session } = useSession()
//   const [isFullscreen, setIsFullscreen] = useState(false)
//   const [isLiked, setIsLiked] = useState(false)
//   const [isSaved, setIsSaved] = useState(false)
//   const [fontSize, setFontSize] = useState(16)
//   const [isCommenting, setIsCommenting] = useState(false)
//   const [commentContent, setCommentContent] = useState("")
//   const [chapter, setChapter] = useState(initialChapter)
//   const [isLoadingComments, setIsLoadingComments] = useState(true)
//   const { toast } = useToast()
//   const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
//   const [showBookmarkNote, setShowBookmarkNote] = useState(false)
//   const [bookmarkNote, setBookmarkNote] = useState("")
//   const [authorData, setAuthorData] = useState({
//     books: [],
//     followers: []
//   })

//   // Fetch author data when component mounts
//   useEffect(() => {
//     const fetchAuthorData = async () => {
//       try {
//         console.log('Fetching author data for ID:', book.authorId)
//         const response = await fetch(`/api/authors/${book.authorId}`)
//         if (!response.ok) {
//           throw new Error('Failed to fetch author data')
//         }
//         const data = await response.json()
//         console.log('Received author data:', data)
//         setAuthorData(data)
//       } catch (error) {
//         console.error('Error fetching author data:', error)
//       }
//     }

//     if (book.authorId) {
//       fetchAuthorData()
//     }
//   }, [book.authorId])

//   // Add console log for authorData changes
//   useEffect(() => {
//     console.log('Author data updated:', authorData)
//   }, [authorData])

//   // Fetch comments when component mounts
//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const response = await fetch(`/api/chapters/${chapter.id}/comments`)
//         if (!response.ok) {
//           throw new Error('Failed to fetch comments')
//         }
//         const comments = await response.json()
//         setChapter(prev => ({
//           ...prev,
//           comments
//         }))
//       } catch (error) {
//         console.error('Error fetching comments:', error)
//         toast({
//           title: "Error",
//           description: "Failed to load comments. Please try again.",
//           variant: "destructive",
//         })
//       } finally {
//         setIsLoadingComments(false)
//       }
//     }

//     fetchComments()
//   }, [chapter.id, toast])

//   // Fetch bookmarks when component mounts
//   useEffect(() => {
//     const fetchBookmarks = async () => {
//       if (!session?.user) return

//       try {
//         // Fetch bookmarks for all chapters in the book
//         const bookmarksPromises = book.chapters.map(ch => 
//           fetch(`/api/chapters/${ch.id}/bookmarks`).then(res => res.json())
//         )
//         const bookmarksArrays = await Promise.all(bookmarksPromises)
//         const allBookmarks = bookmarksArrays.flat()
//         setBookmarks(allBookmarks)
//       } catch (error) {
//         console.error('Error fetching bookmarks:', error)
//         toast({
//           title: "Error",
//           description: "Failed to load bookmarks. Please try again.",
//           variant: "destructive",
//         })
//       }
//     }

//     fetchBookmarks()
//   }, [book.chapters, session?.user, toast])

//   // Add console logs to debug
//   console.log('Session:', session)
//   console.log('Comment Content:', commentContent)
//   console.log('Is Commenting:', isCommenting)
//   console.log('Button Disabled:', isCommenting || !commentContent.trim())

//   const slug = book.title.toLowerCase().replace(/\s+/g, '-')
//   const currentIndex = book.chapters.findIndex(c => c.order === chapter.order)
//   const isFirstChapter = currentIndex === 0
//   const isLastChapter = currentIndex === book.chapters.length - 1
//   const prevChapter = !isFirstChapter ? book.chapters[currentIndex - 1] : null
//   const nextChapter = !isLastChapter ? book.chapters[currentIndex + 1] : null

//   // Validate chapter order is within bounds
//   const validateChapterOrder = (order: number) => {
//     return order >= 1 && order <= book.chapters.length
//   }

//   const getChapterUrl = (order: number) => {
//     if (!validateChapterOrder(order)) return '#'
//     return `/books/${slug}/chapters/${order}`
//   }

//   const toggleFullscreen = () => setIsFullscreen(!isFullscreen)
//   const toggleLike = () => setIsLiked(!isLiked)
//   const toggleSave = () => setIsSaved(!isSaved)
//   const increaseFontSize = () => fontSize < 24 && setFontSize(fontSize + 2)
//   const decreaseFontSize = () => fontSize > 12 && setFontSize(fontSize - 2)

//   const handleCommentSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!session?.user) {
//       toast({
//         title: "Authentication required",
//         description: "Please sign in to post a comment.",
//         variant: "destructive",
//       })
//       return
//     }

//     if (!commentContent.trim()) {
//       toast({
//         title: "Empty comment",
//         description: "Please write something before posting.",
//         variant: "destructive",
//       })
//       return
//     }

//     setIsCommenting(true)
//     try {
//       const response = await fetch(`/api/chapters/${chapter.id}/comments`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           content: commentContent.trim(),
//         }),
//       })

//       if (!response.ok) {
//         const error = await response.text()
//         throw new Error(error)
//       }

//       const newComment = await response.json()

//       // Update the chapter state with the new comment
//       setChapter(prev => ({
//         ...prev,
//         comments: [newComment, ...(prev.comments || [])]
//       }))

//       toast({
//         title: "Comment posted",
//         description: "Your comment has been successfully posted.",
//       })
      
//       setCommentContent("")
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Failed to post comment. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsCommenting(false)
//     }
//   }

//   const handleBookmarkClick = (position: number) => {
//     const contentElement = document.querySelector('.prose')
//     if (!contentElement) return

//     const scrollHeight = contentElement.scrollHeight - contentElement.clientHeight
//     contentElement.scrollTop = (position / 100) * scrollHeight
//   }

//   const handleAddBookmark = async () => {
//     if (!session?.user) {
//       toast({
//         title: "Authentication required",
//         description: "Please sign in to add bookmarks.",
//         variant: "destructive",
//       })
//       return
//     }

//     // Get the selected text and its position
//     const selection = window.getSelection()
//     if (!selection || selection.isCollapsed) {
//       toast({
//         title: "No text selected",
//         description: "Please select some text to create a bookmark.",
//         variant: "destructive",
//       })
//       return
//     }

//     const range = selection.getRangeAt(0)
//     const contentElement = document.querySelector('.prose')
//     if (!contentElement) {
//       toast({
//         title: "Error",
//         description: "Could not find content element.",
//         variant: "destructive",
//       })
//       return
//     }

//     // Calculate position relative to the content element
//     const contentRect = contentElement.getBoundingClientRect()
//     const selectionRect = range.getBoundingClientRect()
    
//     // Calculate position as percentage from the top of the content
//     const position = Math.round(((selectionRect.top - contentRect.top) / contentRect.height) * 100)
    
//     // Store the selected text's position and dimensions
//     const selectedText = selection.toString().trim()
//     const selectionStart = range.startOffset
//     const selectionEnd = range.endOffset
//     const selectionWidth = selectionRect.width
//     const selectionLeft = selectionRect.left - contentRect.left
    
//     // Debug logs
//     console.log('Selection:', {
//       text: selectedText,
//       position,
//       contentHeight: contentRect.height,
//       selectionTop: selectionRect.top,
//       contentTop: contentRect.top,
//       selectionStart,
//       selectionEnd,
//       selectionWidth,
//       selectionLeft
//     })

//     // Validate position
//     if (position < 0 || position > 100) {
//       toast({
//         title: "Error",
//         description: "Invalid selection position.",
//         variant: "destructive",
//       })
//       return
//     }

//     try {
//       const requestBody = {
//         position,
//         note: bookmarkNote.trim() || null,
//         selectedText,
//         selectionStart,
//         selectionEnd,
//         selectionWidth,
//         selectionLeft
//       }
//       console.log('Sending request with body:', requestBody)

//       const response = await fetch(`/api/chapters/${chapter.id}/bookmarks`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody),
//       })

//       if (!response.ok) {
//         const errorText = await response.text()
//         console.error('Error Response:', errorText)
//         throw new Error(errorText)
//       }

//       const newBookmark = await response.json()
//       console.log('Received new bookmark:', newBookmark)
      
//       setBookmarks(prev => [...prev, newBookmark])
//       setShowBookmarkNote(false)
//       setBookmarkNote("")
//       selection.removeAllRanges() // Clear the selection

//       toast({
//         title: "Bookmark added",
//         description: "Bookmark added for selected text.",
//       })
//     } catch (error) {
//       console.error('Error adding bookmark:', error)
//       toast({
//         title: "Error",
//         description: "Failed to add bookmark. Please try again.",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleDeleteBookmark = async (bookmarkId: string) => {
//     try {
//       const response = await fetch(`/api/chapters/${chapter.id}/bookmarks/${bookmarkId}`, {
//         method: 'DELETE',
//       })

//       if (!response.ok) {
//         throw new Error('Failed to delete bookmark')
//       }

//       setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
//       toast({
//         title: "Bookmark deleted",
//         description: "Bookmark has been successfully deleted.",
//       })
//     } catch (error) {
//       console.error('Error deleting bookmark:', error)
//       toast({
//         title: "Error",
//         description: "Failed to delete bookmark. Please try again.",
//         variant: "destructive",
//       })
//     }
//   }

//   return (
//     <div className={`min-h-screen bg-background ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
//       {/* Header */}
//       {/* <header className={`sticky top-0 z-40 border-b bg-background ${isFullscreen ? "hidden" : ""}`}>
//         <div className="container flex h-16 items-center justify-between py-4">
//           <div className="flex items-center gap-2">
//             <Button variant="ghost" size="icon" asChild>
//               <Link href={`/books/${slug}`}>
//                 <ArrowLeft className="h-5 w-5" />
//                 <span className="sr-only">Back to Book</span>
//               </Link>
//             </Button>
//             <span className="text-lg font-semibold truncate max-w-[200px] md:max-w-md">
//               {book.title}
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button variant="ghost" size="icon" onClick={toggleLike} className={isLiked ? "text-red-500" : ""}>
//               <Heart className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
//               <span className="sr-only">Like</span>
//             </Button>
//             <Button variant="ghost" size="icon">
//               <Share2 className="h-5 w-5" />
//               <span className="sr-only">Share</span>
//             </Button>
//             <Button variant="ghost" size="icon" onClick={toggleSave} className={isSaved ? "text-primary" : ""}>
//               <Bookmark className="h-5 w-5" fill={isSaved ? "currentColor" : "none"} />
//               <span className="sr-only">Save</span>
//             </Button>
//             <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
//               {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
//               <span className="sr-only">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
//             </Button>
//           </div>
//         </div>
//       </header> */}

//       {/* Main content */}
//       <main className="container py-6">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Main content - Make it span 2 columns */}
//           <div className={`${isFullscreen ? "col-span-3" : "md:col-span-2"}`}>
//             <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
//               <div className="flex justify-between items-center mb-4">
//                 <div className="flex items-center gap-2">
//                   <Button 
//                     variant="outline" 
//                     size="sm" 
//                     asChild
//                     disabled={isFirstChapter}
//                   >
//                     <Link href={getChapterUrl(prevChapter?.order || 1)}>
//                       <ChevronLeft className="h-4 w-4 mr-1" />
//                       Previous
//                     </Link>
//                   </Button>
//                   <span className="text-sm text-muted-foreground">
//                     Chapter {chapter.order} of {book.chapters.length}
//                   </span>
//                   <Button 
//                     variant="outline" 
//                     size="sm" 
//                     asChild
//                     disabled={isLastChapter}
//                   >
//                     <Link href={getChapterUrl(nextChapter?.order || book.chapters.length)}>
//                       Next
//                       <ChevronRight className="h-4 w-4 ml-1" />
//                     </Link>
//                   </Button>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Button variant="ghost" size="sm" onClick={decreaseFontSize} disabled={fontSize <= 12}>
//                     A-
//                   </Button>
//                   <Button variant="ghost" size="sm" onClick={increaseFontSize} disabled={fontSize >= 24}>
//                     A+
//                   </Button>
//                 </div>
//               </div>

//               <div className="prose dark:prose-invert max-w-none relative" style={{ fontSize: `${fontSize}px` }}>
//                 <h2>Chapter {chapter.order}: {chapter.title}</h2>
//                 <div 
//                   dangerouslySetInnerHTML={{ 
//                     __html: bookmarks.reduce((content, bookmark) => {
//                       if (!bookmark.selectedText) return content;
//                       const regex = new RegExp(bookmark.selectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
//                       return content.replace(regex, `
//                         <span class="bookmark-highlight group" data-bookmark-id="${bookmark.id}" data-position="${bookmark.position}">
//                           $&
//                           <button class="delete-bookmark-btn opacity-0 group-hover:opacity-100 transition-opacity" onclick="window.handleDeleteBookmark('${bookmark.id}')">
//                             <svg class="w-4 h-4 text-red-500 hover:text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                               <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
//                             </svg>
//                           </button>
//                         </span>
//                       `);
//                     }, chapter.content)
//                   }} 
//                 />
//               </div>

//               <style jsx global>{`
//                 .bookmark-highlight {
//                   background-color: rgba(255, 255, 0, 0.2);
//                   border-bottom: 2px solid #FFD700;
//                   cursor: pointer;
//                   transition: all 0.2s ease;
//                   position: relative;
//                   display: inline-block;
//                 }
//                 .bookmark-highlight:hover {
//                   background-color: rgba(255, 255, 0, 0.3);
//                   border-bottom-color: #FFA500;
//                 }
//                 .delete-bookmark-btn {
//                   position: absolute;
//                   top: -8px;
//                   right: -8px;
//                   background: white;
//                   border-radius: 50%;
//                   padding: 2px;
//                   box-shadow: 0 1px 3px rgba(0,0,0,0.1);
//                   z-index: 10;
//                 }
//                 .delete-bookmark-btn:hover {
//                   background: #fee2e2;
//                 }
//               `}</style>

//               {/* Add the delete handler to the window object */}
//               <script dangerouslySetInnerHTML={{
//                 __html: `
//                   window.handleDeleteBookmark = async function(bookmarkId) {
//                     try {
//                       const response = await fetch(\`/api/chapters/${chapter.id}/bookmarks/\${bookmarkId}\`, {
//                         method: 'DELETE',
//                       });
//                       if (!response.ok) throw new Error('Failed to delete bookmark');
//                       window.location.reload();
//                     } catch (error) {
//                       console.error('Error deleting bookmark:', error);
//                     }
//                   };
//                 `
//               }} />

//               <div className="flex justify-between items-center mt-8">
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   asChild
//                   disabled={isFirstChapter}
//                 >
//                   <Link href={getChapterUrl(prevChapter?.order || 1)}>
//                     <ChevronLeft className="h-4 w-4 mr-1" />
//                     Previous Chapter
//                   </Link>
//                 </Button>
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   asChild
//                   disabled={isLastChapter}
//                 >
//                   <Link href={getChapterUrl(nextChapter?.order || book.chapters.length)}>
//                     Next Chapter
//                     <ChevronRight className="h-4 w-4 ml-1" />
//                   </Link>
//                 </Button>
//               </div>
//             </div>

//             {/* Comments section */}
//             <div className="bg-card rounded-lg shadow-sm border p-6">
//               <h3 className="text-lg font-semibold mb-4">Comments</h3>
              
//               {/* Comment form */}
//               <form onSubmit={handleCommentSubmit} className="mb-6">
//                 {session?.user ? (
//                   <>
//                     <Textarea
//                       placeholder="Write your comment..."
//                       value={commentContent}
//                       onChange={(e) => {
//                         console.log('Textarea changed:', e.target.value)
//                         setCommentContent(e.target.value)
//                       }}
//                       className="mb-2"
//                       rows={3}
//                     />
//                     <Button 
//                       type="submit" 
//                       className="w-full"
//                       disabled={isCommenting || !commentContent.trim()}
//                       onClick={() => {
//                         console.log('Button clicked')
//                         console.log('Is Commenting:', isCommenting)
//                         console.log('Comment Content:', commentContent)
//                       }}
//                     >
//                       {isCommenting ? (
//                         <>
//                           <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                           Posting...
//                         </>
//                       ) : (
//                         <>
//                           <Send className="h-4 w-4 mr-2" />
//                           Post Comment
//                         </>
//                       )}
//                     </Button>
//                   </>
//                 ) : (
//                   <div className="text-center py-4">
//                     <p className="text-sm text-muted-foreground mb-2">
//                       Please sign in to post a comment
//                     </p>
//                     <Button variant="outline" asChild>
//                       <Link href="/auth/signin">Sign In</Link>
//                     </Button>
//                   </div>
//                 )}
//               </form>

//               {/* Comments list */}
//               <div className="space-y-4">
//                 {isLoadingComments ? (
//                   <div className="text-center py-6">
//                     <Loader2 className="h-6 w-6 animate-spin mx-auto" />
//                   </div>
//                 ) : chapter.comments && chapter.comments.length > 0 ? (
//                   <CommentList chapterId={chapter.id} currentUserId={session?.user?.id} />
//                 ) : (
//                   <div className="text-center py-6 text-muted-foreground text-sm">
//                     No comments yet. Be the first to comment!
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Sidebar */}
//           {!isFullscreen && (
//             <div className="md:col-span-1 space-y-6">
//               {/* Book info */}
//               <div className="bg-card rounded-lg shadow-sm border p-6">
//                 <div className="flex gap-4 items-start">
//                   <Image
//                     src={book.author.image || "/placeholder.svg"}
//                     alt={book.title}
//                     width={80}
//                     height={120}
//                     className="rounded-md object-cover"
//                   />
//                   <div>
//                     <h2 className="font-bold text-xl">{book.title}</h2>
//                     <p className="text-sm text-muted-foreground">by {book.author.name}</p>
//                     <div className="flex mt-2">
//                       {[...Array(5)].map((_, i) => (
//                         <svg
//                           key={i}
//                           className={`h-4 w-4 ${i < Math.floor(book.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                         >
//                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                         </svg>
//                       ))}
//                       <span className="text-xs text-muted-foreground ml-1">({(book.rating || 0).toFixed(1)})</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-4">
//                   <div className="flex justify-between text-sm mb-1">
//                     <span>Reading Progress</span>
//                     <span>{book.progress}%</span>
//                   </div>
//                   <Progress value={book.progress} className="h-2" />
//                 </div>

//                 <div className="flex flex-wrap gap-1 mt-4">
//                   {book.tags.map((tag) => (
//                     <Badge key={tag} variant="secondary" className="text-xs">
//                       {tag}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>

//               {/* Add Bookmark section */}
//               <div className="bg-card rounded-lg shadow-sm border p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="font-semibold">Add Bookmark</h3>
//                   {session?.user && (
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => setShowBookmarkNote(true)}
//                     >
//                       <BookmarkIcon className="h-4 w-4 mr-2" />
//                       Add Bookmark
//                     </Button>
//                   )}
//                 </div>

//                 {showBookmarkNote && (
//                   <div className="mb-4">
//                     <Textarea
//                       placeholder="Add a note about this bookmark (optional)"
//                       value={bookmarkNote}
//                       onChange={(e) => setBookmarkNote(e.target.value)}
//                       className="mb-2"
//                       rows={2}
//                     />
//                     <div className="flex gap-2">
//                       <Button
//                         size="sm"
//                         onClick={handleAddBookmark}
//                         className="flex-1"
//                       >
//                         Save
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => {
//                           setShowBookmarkNote(false)
//                           setBookmarkNote("")
//                         }}
//                       >
//                         Cancel
//                       </Button>
//                     </div>
//                   </div>
//                 )}

//                 {!session?.user && (
//                   <div className="text-center py-4">
//                     <p className="text-sm text-muted-foreground mb-2">
//                       Please sign in to add bookmarks
//                     </p>
//                     <Button variant="outline" asChild>
//                       <Link href="/auth/signin">Sign In</Link>
//                     </Button>
//                   </div>
//                 )}
//               </div>

//               {/* Chapters */}
//               <div className="bg-card rounded-lg shadow-sm border p-6">
//                 <h3 className="font-semibold mb-4">Chapters</h3>
//                 <Tabs defaultValue="all">
//                   <TabsList className="grid w-full grid-cols-2 mb-4">
//                     <TabsTrigger value="all">All</TabsTrigger>
//                     <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
//                   </TabsList>
//                   <TabsContent value="all" className="space-y-2">
//                     {book.chapters.map((ch) => (
//                       <Link
//                         key={ch.id}
//                         href={getChapterUrl(ch.order)}
//                       >
//                         <button
//                           className={`flex items-center justify-between w-full p-2 rounded-md text-left ${
//                             chapter.id === ch.id ? "bg-primary/10" : "hover:bg-muted"
//                           }`}
//                         >
//                           <div>
//                             <div className="font-medium text-sm">
//                               Chapter {ch.order}: {ch.title}
//                             </div>
//                             {ch.progress > 0 && (
//                               <div className="text-xs text-muted-foreground">
//                                 {ch.progress === 100 ? "Completed" : `${ch.progress}% read`}
//                               </div>
//                             )}
//                           </div>
//                           {ch.progress === 100 && (
//                             <div className="h-2 w-2 rounded-full bg-green-500" />
//                           )}
//                         </button>
//                       </Link>
//                     ))}
//                   </TabsContent>
//                   <TabsContent value="bookmarked" className="space-y-2">
//                     {book.chapters.map((ch) => {
//                       // Find bookmarks for this chapter
//                       const chapterBookmarks = bookmarks.filter(b => b.chapterId === ch.id)
//                       if (chapterBookmarks.length === 0) return null

//                       return (
//                         <div key={ch.id} className="space-y-2">
//                           <Link href={getChapterUrl(ch.order)}>
//                             <button
//                               className={`flex items-center justify-between w-full p-2 rounded-md text-left ${
//                                 chapter.id === ch.id ? "bg-primary/10" : "hover:bg-muted"
//                               }`}
//                             >
//                               <div>
//                                 <div className="font-medium text-sm">
//                                   Chapter {ch.order}: {ch.title}
//                                 </div>
//                                 <div className="text-xs text-muted-foreground">
//                                   {chapterBookmarks.length} bookmark{chapterBookmarks.length !== 1 ? 's' : ''}
//                                 </div>
//                               </div>
//                               <BookmarkIcon className="h-4 w-4 text-primary" />
//                             </button>
//                           </Link>
//                           {/* Show bookmarks for this chapter */}
//                           <div className="pl-4 space-y-1">
//                             {chapterBookmarks.map((bookmark) => (
//                               <div
//                                 key={bookmark.id}
//                                 className="text-sm text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted group relative"
//                               >
//                                 <div 
//                                   className="cursor-pointer"
//                                   onClick={() => {
//                                     window.location.href = getChapterUrl(ch.order)
//                                     handleBookmarkClick(bookmark.position)
//                                   }}
//                                 >
//                                   {bookmark.selectedText ? (
//                                     <span className="italic">&ldquo;{bookmark.selectedText}&rdquo;</span>
//                                   ) : (
//                                     <span>At {Math.round(bookmark.position)}%</span>
//                                   )}
//                                   {bookmark.note && (
//                                     <div className="text-xs mt-0.5">{bookmark.note}</div>
//                                   )}
//                                 </div>
//                                 <button
//                                   onClick={() => handleDeleteBookmark(bookmark.id)}
//                                   className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-full"
//                                 >
//                                   <Trash2 className="h-4 w-4 text-red-500" />
//                                 </button>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )
//                     }).filter(Boolean)}
//                     {!bookmarks.length && (
//                       <div className="text-center py-6 text-muted-foreground text-sm">
//                         No bookmarked chapters yet
//                       </div>
//                     )}
//                   </TabsContent>
//                 </Tabs>
//               </div>

//               {/* Author info */}
//               <div className="bg-card rounded-lg shadow-sm border p-6">
//                 <h3 className="font-semibold mb-4">About the Author</h3>
//                 <div className="flex items-start gap-3 mb-4">
//                   <Avatar className="h-12 w-12">
//                     <AvatarImage src={book.author.image || ""} alt={book.author.name || ""} />
//                     <AvatarFallback>{book.author.name?.charAt(0)}</AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <h4 className="font-medium">{book.author.name}</h4>
//                     <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-1">
//                       <span>{authorData.books.length} books</span>
//                     </div>
//                   </div>
//                 </div>
//                 <Button variant="outline" className="w-full" asChild>
//                   <Link href={`/authors/${book.author.id}`}>
//                     View Profile
//                   </Link>
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   )
// }