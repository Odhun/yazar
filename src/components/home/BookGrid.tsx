import { BookCard } from "@/components/book/BookCard";
import type { Book } from "@/types/book";

interface Props {
  books: Book[];
}

export function BookGrid({ books }: Props) {
  return (
    <section className="px-6 pb-20">
      <div className="max-w-5xl mx-auto">
        <div
          className="flex items-center gap-3 mb-8"
        >
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Kitaplarım
          </h2>
          <span
            className="text-sm px-2 py-0.5 rounded-full"
            style={{
              background: "var(--accent-light)",
              color: "var(--accent)",
            }}
          >
            {books.length}
          </span>
        </div>

        {books.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>Henüz kitap eklenmedi.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {books.map((book) => (
              <BookCard key={book.slug} book={book} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
