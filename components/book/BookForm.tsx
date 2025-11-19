"use client"

import { Plus, Trash2, X, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from "react"
import * as z from "zod"
import Link from "next/link"
import { ArrowLeft, BookOpen, Save } from "lucide-react"
import { toast } from "sonner"

export const BookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()),
  chapters: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, "Chapter title is required"),
    content: z.string(),
  })),
  published: z.boolean().default(false),
})

interface Chapter {
  id: string
  title: string
  content: string
}

interface BookFormProps {
  initialData?: z.infer<typeof BookSchema>
  onSubmit: (data: z.infer<typeof BookSchema>) => Promise<void>
  backUrl: string
  submitLabel: string
}

export function BookForm({ initialData, onSubmit, backUrl, submitLabel }: BookFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [newTag, setNewTag] = useState("")
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [newChapterTitle, setNewChapterTitle] = useState("")
  const [currentChapter, setCurrentChapter] = useState<Chapter>(() => {
    if (initialData?.chapters && initialData.chapters.length > 0) {
      return initialData.chapters[0]
    }
    return {
      id: Date.now().toString(),
      title: "New Chapter",
      content: "",
    }
  })

  const form = useForm<z.infer<typeof BookSchema>>({
    resolver: zodResolver(BookSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      tags: [],
      chapters: [{
        id: Date.now().toString(),
        title: "Chapter 1",
        content: "",
      }],
      published: false,
    },
  })

  const { watch, setValue } = form
  const chapters = watch("chapters")

  useEffect(() => {
    if (chapters.length > 0 && !currentChapter.id) {
      setCurrentChapter(chapters[0])
    }
  }, [chapters, currentChapter.id])

  const handleChapterSelect = (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId)
    if (chapter) {
      setCurrentChapter(chapter)
    }
  }

  const handleContentChange = (content: string) => {
    const chapterIndex = chapters.findIndex((ch) => ch.id === currentChapter.id)
    if (chapterIndex === -1) return

    const updatedChapters = [...chapters]
    updatedChapters[chapterIndex] = {
      ...updatedChapters[chapterIndex],
      content
    }

    setValue("chapters", updatedChapters, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })

    setCurrentChapter(prev => ({
      ...prev,
      content
    }))
  }

  const handleSubmit = async (data: z.infer<typeof BookSchema>) => {
    try {
      setIsLoading(true)
      await onSubmit(data)
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Something went wrong! Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const addNewChapter = () => {
    const newChapter = {
      id: Date.now().toString(),
      title: `Chapter ${chapters.length + 1}`,
      content: "",
    }
    setValue("chapters", [...chapters, newChapter], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
    setCurrentChapter(newChapter)
  }

  const deleteChapter = (chapterId: string) => {
    if (chapters.length <= 1) {
      toast.error("You must have at least one chapter")
      return
    }

    const updatedChapters = chapters
      .filter(ch => ch.id !== chapterId)
      .map((ch, index) => ({
        ...ch,
        title: ch.title.startsWith("Chapter ") ? `Chapter ${index + 1}` : ch.title
      }))

    setValue("chapters", updatedChapters, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })

    if (chapterId === currentChapter.id) {
      const currentIndex = chapters.findIndex(ch => ch.id === chapterId)
      const newIndex = Math.max(0, currentIndex - 1)
      setCurrentChapter(chapters[newIndex])
    }
  }

  const handleEditChapterTitle = (chapterId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast.error("Chapter title cannot be empty")
      return
    }

    const updatedChapters = chapters.map(ch => 
      ch.id === chapterId ? { ...ch, title: newTitle.trim() } : ch
    )
    setValue("chapters", updatedChapters, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })

    if (currentChapter.id === chapterId) {
      setCurrentChapter({ ...currentChapter, title: newTitle.trim() })
    }

    setEditingChapter(null)
    setNewChapterTitle("")
  }

  return (
    <div className="container py-10 px-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href={backUrl}>
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
              <h1 className="text-3xl font-bold">
                {initialData ? 'Edit Book' : 'Write Your Book'}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => handleSubmit(form.getValues())} 
                disabled={isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <BookOpen className="mr-2 h-4 w-4 animate-spin" />
                    {initialData ? 'Updating...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    {submitLabel}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="py-5 gap-4">
                <CardHeader className="gap-2">
                  <CardTitle>Book Details</CardTitle>
                  <CardDescription>Manage your book information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="chapters">Chapters</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {activeTab === "details" ? (
                    <div className="space-y-4 mt-4">
                      {/* Form Fields */}
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter book title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Write a brief description" rows={4} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Tags Field */}
                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Add a tag"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault()
                                        if (newTag.trim()) {
                                          field.onChange([...field.value, newTag.trim()])
                                          setNewTag("")
                                        }
                                      }
                                    }}
                                  />
                                  <Button 
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      if (newTag.trim()) {
                                        field.onChange([...field.value, newTag.trim()])
                                        setNewTag("")
                                      }
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {field.value.map((tag) => (
                                    <Badge key={tag} variant="secondary">
                                      {tag}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          field.onChange(field.value.filter(t => t !== tag))
                                        }}
                                        className="ml-1"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4 mt-4">
                      <Button variant="outline" className="w-full justify-start" onClick={addNewChapter}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Chapter
                      </Button>

                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-2">
                          {chapters.map((chapter) => (
                            <div
                              key={chapter.id}
                              className={`flex items-center justify-between p-2 rounded-md ${
                                currentChapter.id === chapter.id
                                  ? "bg-primary/10 border border-primary/20"
                                  : "hover:bg-muted"
                              }`}
                            >
                              <div className="flex-1 flex items-center gap-2">
                                <button
                                  type="button"
                                  className="flex-1 text-left"
                                  onClick={() => handleChapterSelect(chapter.id)}
                                >
                                  {chapter.title}
                                </button>
                                <Dialog open={editingChapter?.id === chapter.id} onOpenChange={(open) => {
                                  if (!open) {
                                    setEditingChapter(null)
                                    setNewChapterTitle("")
                                  }
                                }}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8"
                                      onClick={() => {
                                        setEditingChapter(chapter)
                                        setNewChapterTitle(chapter.title)
                                      }}
                                    >
                                      <Pencil className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Chapter Title</DialogTitle>
                                      <DialogDescription>
                                        Enter a new title for this chapter.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <Input
                                        value={newChapterTitle}
                                        onChange={(e) => setNewChapterTitle(e.target.value)}
                                        placeholder="Enter chapter title"
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button 
                                        type="button"
                                        variant="outline" 
                                        onClick={() => {
                                          setEditingChapter(null)
                                          setNewChapterTitle("")
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button 
                                        type="button"
                                        onClick={() => handleEditChapterTitle(chapter.id, newChapterTitle)}
                                      >
                                        Save Changes
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Chapter</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete {chapter.title}? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => {}}>
                                      Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={() => deleteChapter(chapter.id)}>
                                      Delete
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      {currentChapter.title}
                    </h2>
                    <div className="text-sm text-muted-foreground">
                      {chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Textarea
                    value={currentChapter.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Start writing your chapter here..."
                    className="min-h-[60vh] rounded-none border-0 resize-none focus-visible:ring-0 p-6"
                  />
                </CardContent>
                <CardFooter className="border-t p-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-muted-foreground">
                      {currentChapter.content.split(/\s+/).filter(Boolean).length} words
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("chapters")}>
                      Manage Chapters
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
} 