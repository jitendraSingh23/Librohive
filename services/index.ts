import axios from "axios"
import { BookFormValues } from "@/schemas/book"

export const bookService = {
  async createBook(data: BookFormValues) {
    const response = await axios.post("/api/upload/writebook", data)
    return response.data
  },

  async updateBook(bookId: string, data: BookFormValues) {
    const response = await axios.patch(`/api/books/${bookId}`, data)
    return response.data
  },

  async deleteBook(bookId: string) {
    const response = await axios.delete(`/api/books/${bookId}`)
    return response.data
  }
}