import { notFound } from "next/navigation";
import { getBook, getAllSlugs } from "@/lib/books";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookDetail } from "@/components/book/BookDetail";
import { CommentSection } from "@/components/book/CommentSection";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params;
  const book = getBook(slug);

  if (!book) notFound();

  return (
    <>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <BookDetail book={book} />
        <CommentSection slug={book.slug} />
      </main>
      <Footer />
    </>
  );
}
