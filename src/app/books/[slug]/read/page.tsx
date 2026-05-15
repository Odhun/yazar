import { notFound } from "next/navigation";
import { getBook, getAllSlugs } from "@/lib/books";
import { ReadPageClient } from "@/components/reader/ReadPageClient";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ReadPage({ params }: Props) {
  const { slug } = await params;
  const book = getBook(slug);

  if (!book) notFound();

  return <ReadPageClient book={book} />;
}
