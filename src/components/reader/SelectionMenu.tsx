"use client";

import { useState, useEffect, useRef } from "react";
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

export function SelectionMenu({ position, cfiRange, text, onClose, onSave, onHighlightAdd }: Props) {
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [pendingColor, setPendingColor] = useState<HighlightColor>("yellow");
  const menuRef = useRef<HTMLDivElement>(null);

  // Menü dışına tıklanınca kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Escape ile kapat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
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

  const handleColorClick = (color: HighlightColor) => {
    if (showNote) {
      setPendingColor(color);
    } else {
      save(color);
    }
  };

  const handleSaveWithNote = () => {
    save(pendingColor, note);
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 rounded-xl shadow-xl border text-sm"
      style={{
        left: position.x,
        top: position.y,
        transform: "translateX(-50%) translateY(-110%)",
        background: "var(--bg-card)",
        borderColor: "var(--border)",
        minWidth: showNote ? "240px" : "auto",
      }}
    >
      {!showNote ? (
        <div className="flex items-center gap-1 p-2">
          {/* Renk seçenekleri */}
          {COLORS.map(({ value, bg, label }) => (
            <button
              key={value}
              onClick={() => handleColorClick(value)}
              title={label}
              className="w-6 h-6 rounded-full border-2 border-white transition-transform hover:scale-110"
              style={{ background: bg, boxShadow: "0 0 0 1px rgba(0,0,0,.1)" }}
            />
          ))}

          {/* Not ekle */}
          <div
            className="w-px h-4 mx-1"
            style={{ background: "var(--border)" }}
          />
          <button
            onClick={() => {
              setShowNote(true);
              setPendingColor("yellow");
            }}
            title="Not ekle"
            className="p-1 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <StickyNote size={15} />
          </button>

          {/* Kapat */}
          <button
            onClick={onClose}
            title="Kapat"
            className="p-1 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
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
                onClick={() => setPendingColor(value)}
                title={label}
                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: bg,
                  borderColor:
                    pendingColor === value ? "var(--text-primary)" : "white",
                  boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
                }}
              />
            ))}
          </div>

          {/* Seçilen metin önizleme */}
          <p
            className="text-xs mb-2 line-clamp-2 italic"
            style={{ color: "var(--text-muted)" }}
          >
            "{text.slice(0, 80)}{text.length > 80 ? "…" : ""}"
          </p>

          {/* Not textarea */}
          <textarea
            autoFocus
            placeholder="Notunuzu yazın..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={300}
            className="w-full px-2 py-1.5 rounded-lg text-xs resize-none outline-none mb-3"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />

          <div className="flex gap-2">
            <button
              onClick={handleSaveWithNote}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Highlighter size={13} />
              Kaydet
            </button>
            <button
              onClick={() => setShowNote(false)}
              className="px-3 py-1.5 rounded-lg text-xs"
              style={{
                background: "var(--bg-surface)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              Geri
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
