"use client";

import { assetUrl } from "@/lib/asset";
import { AUTHOR } from "@/lib/books";

export function AuthorBio() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-10 items-center sm:items-start">
        <div className="shrink-0">
          <img
            src={assetUrl(AUTHOR.photo)}
            alt={AUTHOR.name}
            width={128}
            height={128}
            className="w-32 h-32 rounded-full object-cover"
            style={{ outline: "4px solid var(--accent-light)", outlineOffset: "2px" }}
            onError={(e) => {
              // Fotoğraf yoksa placeholder göster
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' rx='64' fill='%23ede9fe'/%3E%3Ctext x='64' y='72' text-anchor='middle' font-size='48' fill='%237c3aed'%3E✍%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>

        <div className="text-center sm:text-left">
          <h1
            className="text-3xl font-bold tracking-tight mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            {AUTHOR.name}
          </h1>
          <p
            className="text-base leading-relaxed max-w-xl"
            style={{ color: "var(--text-secondary)" }}
          >
            {AUTHOR.bio}
          </p>
        </div>
      </div>
    </section>
  );
}
