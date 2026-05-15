"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, Globe, Tag } from "lucide-react";
import { assetUrl } from "@/lib/asset";
import type { Book } from "@/types/book";

const LANG_MAP: Record<string, string> = {
  tr: "Türkçe",
  en: "İngilizce",
};

interface Props {
  book: Book;
}

export function BookDetail({ book }: Props) {
  return (
    <div>
      {/* Geri butonu */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft size={16} />
        Tüm Kitaplar
      </Link>

      {/* Ana içerik */}
      <div className="flex flex-col sm:flex-row gap-10">
        {/* Kapak */}
        <div className="shrink-0">
          <div
            className="w-44 sm:w-52 rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <img
              src={assetUrl(book.coverImage)}
              alt={`${book.title} kapak`}
              className="w-full aspect-[3/4] object-cover"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.parentElement!.innerHTML = `<div style="width:100%;aspect-ratio:3/4;display:flex;align-items:center;justify-content:center;background:var(--accent-light);color:var(--accent);font-size:4rem;">📖</div>`;
              }}
            />
          </div>
        </div>

        {/* Bilgiler */}
        <div className="flex-1">
          <h1
            className="text-3xl font-bold leading-tight mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {book.title}
          </h1>
          <p
            className="text-base mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            {book.author}
          </p>

          {/* Meta bilgiler */}
          <div className="flex flex-wrap gap-3 mb-8">
            <MetaBadge icon={<Tag size={14} />} label={book.genre} />
            <MetaBadge
              icon={<Calendar size={14} />}
              label={String(book.publishedYear)}
            />
            <MetaBadge
              icon={<Globe size={14} />}
              label={LANG_MAP[book.language] ?? book.language}
            />
            {book.pageCount && (
              <MetaBadge
                icon={<BookOpen size={14} />}
                label={`${book.pageCount} sayfa`}
              />
            )}
          </div>

          {/* Özet */}
          <p
            className="text-sm leading-relaxed mb-8 max-w-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            {book.summary}
          </p>

          {/* CTA */}
          <Link
            href={`/books/${book.slug}/read`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors"
            style={{
              background: "var(--accent)",
              color: "#ffffff",
            }}
          >
            <BookOpen size={18} />
            Okumaya Başla
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetaBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
      style={{
        background: "var(--bg-surface)",
        color: "var(--text-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      {icon}
      {label}
    </span>
  );
}
