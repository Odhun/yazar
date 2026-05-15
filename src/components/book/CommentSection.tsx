"use client";

import { useState } from "react";
import { MessageSquare, Star, Send } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage";
import type { Comment } from "@/types/storage";

interface Props {
  slug: string;
}

export function CommentSection({ slug }: Props) {
  const [comments, setComments, loaded] = useLocalStorage<Comment[]>(
    STORAGE_KEYS.comments(slug),
    []
  );
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    setSubmitting(true);
    const comment: Comment = {
      id: crypto.randomUUID(),
      authorName: name.trim(),
      text: text.trim(),
      rating,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [comment, ...prev]);
    setName("");
    setText("");
    setRating(5);
    setSubmitting(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <section className="mt-16 pt-12 border-t" style={{ borderColor: "var(--border)" }}>
      <h2
        className="text-xl font-semibold mb-8 flex items-center gap-2"
        style={{ color: "var(--text-primary)" }}
      >
        <MessageSquare size={20} style={{ color: "var(--accent)" }} />
        Okuyucu Notları
        {loaded && comments.length > 0 && (
          <span
            className="text-sm px-2 py-0.5 rounded-full ml-1"
            style={{ background: "var(--accent-light)", color: "var(--accent)" }}
          >
            {comments.length}
          </span>
        )}
      </h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl p-6 mb-10"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow)",
        }}
      >
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--text-secondary)" }}
        >
          Not bırak
        </h3>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Adınız"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-colors"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            required
          />

          {/* Yıldız puanı */}
          <div className="flex items-center gap-1">
            {([1, 2, 3, 4, 5] as const).map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-colors"
              >
                <Star
                  size={20}
                  fill={(hoverRating || rating) >= star ? "var(--accent)" : "none"}
                  style={{
                    color:
                      (hoverRating || rating) >= star
                        ? "var(--accent)"
                        : "var(--text-muted)",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <textarea
          placeholder="Bu kitap hakkında düşüncelerinizi paylaşın..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none transition-colors mb-4"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
          required
        />

        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Notlar sadece bu cihazda görünür.
          </p>
          <button
            type="submit"
            disabled={submitting || !name.trim() || !text.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ background: "var(--accent)", color: "#ffffff" }}
          >
            <Send size={14} />
            Gönder
          </button>
        </div>
      </form>

      {/* Yorum listesi */}
      {!loaded ? null : comments.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Henüz not bırakılmamış. İlk notu sen bırak!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-xl p-5"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-medium text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {c.authorName}
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {([1, 2, 3, 4, 5] as const).map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={c.rating >= s ? "var(--accent)" : "none"}
                        style={{
                          color:
                            c.rating >= s ? "var(--accent)" : "var(--text-muted)",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatDate(c.createdAt)}
                  </span>
                </div>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {c.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
