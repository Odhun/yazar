import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthorBio } from "@/components/home/AuthorBio";
import { BookGrid } from "@/components/home/BookGrid";
import { books } from "@/lib/books";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <AuthorBio />
        <BookGrid books={books} />
      </main>
      <Footer />
    </>
  );
}
