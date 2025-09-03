import axios from "axios";

const BASE_URL = "http://localhost:8081/api";

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export const searchBooks = async (query: string): Promise<Book[]> => {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const response = await axios.get(`${BASE_URL}/books/search`, {
    params: { q: query }
  });
  
  return response.data;
};

export const getUsersWhoHaveBook = async (bookId: string): Promise<User[]> => {
  const response = await axios.get(`${BASE_URL}/books/${bookId}/users`);
  return response.data;
};