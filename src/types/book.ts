export interface Book {
  slug: string;
  title: string;
  author: string;
  coverImage: string;
  epubPath: string;
  summary: string;
  genre: string;
  publishedYear: number;
  pageCount?: number;
  language: "tr" | "en";
  isbn?: string;
}
