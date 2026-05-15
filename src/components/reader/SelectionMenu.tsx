"use client";

import { useState, useEffect } from "react";
import { Highlighter, StickyNote, X } from "lucide-react";
import type { Highlight, HighlightColor } from "@/types/reader";

interface Props {
  position: { x: number; y: number };
  cfiRange: string;
  text: string;
  onClose: () => void;
  onSave: (h: Highlight) => void;
  onHighlightAdd?: (cfiRange: string, color: string) => void;
}

const COLORS: { value: HighlightColor; bg: string; label: string }[] = [
  { value: "yellow", bg: "#fde047", label: "Sarı" },
  { value: "green", bg: "#86efac", label: "Yeşil" },
  { value: "blue", bg: "#93c5fd", label: "Mavi" },
  { value: "pink", bg: "#f9a8d4", label: "Pembe" },
];

export function SelectionMenu({
  position,
  cfiRange,
  text,
  onClose,
  onSave,
  onHighlightAdd,
}: Props) {
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [pendingColor, setPendingColor] = useState<HighlightColor>("yellow");

  // Escape ile kapat
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const save = (color: HighlightColor, noteText = "") => {
    const highlight: Highlight = {
      id: crypto.randomUUID(),
      cfi: cfiRange,
      text: text.slice(0, 500),
      note: noteText.trim(),
      color,
      createdAt: new Date().toISOString(),
    };
    onSave(highlight);
    onHighlightAdd?.(cfiRange, color);
    onClose();
  };

  // Menü pozisyonu: ekran dışına çıkmaması için clamp
  const menuW = showNote ? 256 : 180;
  const left = Math.max(8, Math.min(position.x - menuW / 2, window.innerWidth - menuW - 8));
  const top = Math.max(8, position.y - 12);

  return (
    <>
      {/* Backdrop — tüm dış alanı yakalar (mobil dahil) */}
      <div
        className="fixed inset-0 z-40"
        onPointerDown={onClose}
      />

      {/* Menü */}
      <div
        className="fixed z-50 rounded-xl shadow-xl border text-sm"
        style={{
          left,
          top,
          transform: "translateY(-100%)",
          background: "var(--bg-card)",
          borderColor: "var(--border)",
          width: menuW,
          // Menü butonlarına dokunulduğunda seçim silinmesin
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
        // Backdrop'un pointerdown'ını blokla — menü içi tıklama = kapat değil
        onPointerDown={(e) => e.stopPropagation()}
      >
        {!showNote ? (
          <div className="flex items-center gap-1 p-2">
            {COLORS.map(({ value, bg, label }) => (
              <button
                key={value}
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={() => save(value)}
                title={label}
                className="w-7 h-7 rounded-full border-2 border-white flex-shrink-0"
                style={{ background: bg, boxShadow: "0 0 0 1px rgba(0,0,0,.12)", touchAction: "manipulation" }}
              />
            ))}

            <div className="w-px h-4 mx-0.5" style={{ background: "var(--border)" }} />

            <button
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onClick={() => { setShowNote(true); setPendingColor("yellow"); }}
              title="Not ekle"
              className="p-1.5 rounded-lg"
              style={{ color: "var(--text-secondary)", touchAction: "manipulation" }}
            >
              <StickyNote size={15} />
            </button>

            <button
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onClick={onClose}
              title="Kapat"
              className="p-1.5 rounded-lg"
              style={{ color: "var(--text-muted)", touchAction: "manipulation" }}
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <div className="p-3">
            {/* Renk seçimi */}
            <div className="flex gap-1.5 mb-3">
              {COLORS.map(({ value, bg, label }) => (
                <button
                  key={value}
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={() => setPendingColor(value)}
                  title={label}
                  className="w-6 h-6 rounded-full border-2"
                  style={{
                    background: bg,
                    borderColor: pendingColor === value ? "var(--text-primary)" : "white",
                    boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
                    touchAction: "manipulation",
                  }}
                />
              ))}
            </div>

            <p className="text-xs mb-2 line-clamp-2 italic" style={{ color: "var(--text-muted)" }}>
              &ldquo;{text.slice(0, 80)}{text.length > 80 ? "…" : ""}&rdquo;
            </p>

            <textarea
              autoFocus
              placeholder="Notunuzu yazın..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              rows={2}
              maxLength={300}
              className="w-full px-2 py-1.5 rounded-lg text-xs resize-none outline-none mb-3"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                WebkitUserSelect: "text",
                userSelect: "text",
              }}
            />

            <div className="flex gap-2">
              <button
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={() => save(pendingColor, note)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "var(--accent)", color: "#fff", touchAction: "manipulation" }}
              >
                <Highlighter size={13} />
                Kaydet
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={() => setShowNote(false)}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border)", touchAction: "manipulation" }}
              >
                Geri
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
