"use client";

import { X, BookOpen, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Highlight, HighlightColor } from "@/types/reader";

const COLOR_HEX: Record<HighlightColor, string> = {
  yellow: "#fde047",
  green: "#86efac",
  blue: "#93c5fd",
  pink: "#f9a8d4",
};

interface Props {
  highlights: Highlight[];
  onClose: () => void;
  onGoTo: (cfi: string) => void;
  onDelete: (id: string) => void;
}

export function HighlightsPanel({ highlights, onClose, onGoTo, onDelete }: Props) {
  const [copied, setCopied] = useState(false);

  const exportNotes = async () => {
    const lines = highlights.map((h, i) => {
      const date = new Date(h.createdAt).toLocaleDateString("tr-TR");
      const parts = [`${i + 1}. [${h.color}] — ${date}`, `"${h.text}"`];
      if (h.note) parts.push(`Not: ${h.note}`);
      return parts.join("\n");
    });
    const text = lines.join("\n---\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* eski tarayıcı fallback */ }
  };

  return (
    <div
      className="absolute inset-y-0 right-0 flex flex-col z-40 border-l"
      style={{
        width: "min(320px, 90vw)",
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Başlık */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Notlar & İşaretliler
          </span>
          {highlights.length > 0 && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={{
                background: "var(--accent-light)",
                color: "var(--accent)",
              }}
            >
              {highlights.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {highlights.length > 0 && (
            <button
              onClick={exportNotes}
              title="Notları kopyala"
              className="p-1 rounded-lg transition-colors"
              style={{ color: copied ? "var(--accent)" : "var(--text-muted)" }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto p-2">
        {highlights.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full gap-3 py-12"
          >
            <BookOpen size={36} style={{ color: "var(--text-muted)" }} />
            <p
              className="text-sm text-center"
              style={{ color: "var(--text-muted)" }}
            >
              Henüz işaretli metin veya not yok.
              <br />
              Okurken metni seçerek başla.
            </p>
          </div>
        ) : (
          highlights.map((h) => (
            <div
              key={h.id}
              className="rounded-lg p-2.5 mb-2"
              style={{
                background: "var(--bg-surface)",
                border: `1px solid ${COLOR_HEX[h.color]}55`,
              }}
            >
              {/* Renk + metin */}
              <div className="flex items-start gap-2 mb-1.5">
                <div
                  className="shrink-0 w-2.5 h-2.5 rounded-full mt-1"
                  style={{ background: COLOR_HEX[h.color] }}
                />
                <p
                  className="text-xs leading-snug line-clamp-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  &ldquo;{h.text}&rdquo;
                </p>
              </div>

              {/* Not metni */}
              {h.note && (
                <p
                  className="text-xs italic ml-4 mb-2 pl-2 border-l-2"
                  style={{
                    color: "var(--text-secondary)",
                    borderColor: COLOR_HEX[h.color],
                  }}
                >
                  {h.note}
                </p>
              )}

              {/* Aksiyonlar */}
              <div className="flex items-center justify-between ml-4">
                <span
                  className="text-[10px] tabular-nums"
                  style={{ color: "var(--text-muted)" }}
                >
                  {new Date(h.createdAt).toLocaleDateString("tr-TR")}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      onGoTo(h.cfi);
                      onClose();
                    }}
                    className="text-xs px-2 py-0.5 rounded transition-colors"
                    style={{
                      background: "var(--accent-light)",
                      color: "var(--accent)",
                    }}
                  >
                    Git
                  </button>
                  <button
                    onClick={() => onDelete(h.id)}
                    className="text-xs px-2 py-0.5 rounded transition-colors"
                    style={{
                      background: "var(--bg-surface)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
