"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { assetUrl } from "@/lib/asset";
import { STORAGE_KEYS } from "@/lib/storage";
import type { Book } from "@/types/book";

interface Props {
  book: Book;
}

export function BookCard({ book }: Props) {
  const [progressPct, setProgressPct] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.progress(book.slug));
      if (stored) {
        const { percent } = JSON.parse(stored) as { percent: number };
        if (typeof percent === "number" && percent > 0) setProgressPct(percent);
      }
    } catch { /* ignore */ }
  }, [book.slug]);

  return (
    <Link href={`/books/${book.slug}`} className="group block">
      <article
        className="rounded-xl overflow-hidden transition-all duration-200"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        {/* Kapak */}
        <div
          className="aspect-[3/4] overflow-hidden"
          style={{ background: "var(--bg-surface)" }}
        >
          <img
            src={assetUrl(book.coverImage)}
            alt={`${book.title} kapak`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              const parent = el.parentElement!;
              parent.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--accent-light);color:var(--accent);font-size:3rem;">📖</div>`;
            }}
          />
        </div>

        {/* Okuma ilerlemesi */}
        {progressPct !== null && (
          <div className="h-1 w-full" style={{ background: "var(--bg-surface)" }}>
            <div
              className="h-full transition-all"
              style={{ width: `${progressPct}%`, background: "var(--accent)" }}
            />
          </div>
        )}

        {/* Bilgi */}
        <div className="p-4">
          <h3
            className="font-semibold text-sm leading-snug mb-1 line-clamp-2"
            style={{ color: "var(--text-primary)" }}
          >
            {book.title}
          </h3>
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {book.genre} · {book.publishedYear}
            </span>
            {progressPct !== null && (
              <span className="text-xs font-medium shrink-0" style={{ color: "var(--accent)" }}>
                %{progressPct}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
