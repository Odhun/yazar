"use client";

import Link from "next/link";
import { ArrowLeft, Sun, Moon, Sunset, Minus, Plus, BookMarked, List } from "lucide-react";
import type { ReaderTheme, FontFamily } from "@/types/reader";

interface Props {
  theme: ReaderTheme;
  fontSize: number;
  fontFamily: FontFamily;
  bookTitle: string;
  bookSlug: string;
  notesCount: number;
  hasToc: boolean;
  onThemeChange: (t: ReaderTheme) => void;
  onFontSizeChange: (n: number) => void;
  onFontFamilyChange: (f: FontFamily) => void;
  onNotesClick: () => void;
  onTocClick: () => void;
}

const THEMES: { value: ReaderTheme; icon: React.ReactNode; label: string }[] = [
  { value: "light", icon: <Sun size={15} />, label: "Aydınlık" },
  { value: "dark", icon: <Moon size={15} />, label: "Karanlık" },
  { value: "sepia", icon: <Sunset size={15} />, label: "Sepya" },
];

export function ReaderToolbar({
  theme,
  fontSize,
  fontFamily,
  bookTitle,
  bookSlug,
  notesCount,
  hasToc,
  onThemeChange,
  onFontSizeChange,
  onFontFamilyChange,
  onNotesClick,
  onTocClick,
}: Props) {
  return (
    <header
      className="shrink-0 h-12 flex items-center px-4 gap-3 border-b z-30"
      style={{
        background: "var(--bg-primary)",
        borderColor: "var(--border)",
      }}
    >
      {/* Geri */}
      <Link
        href={`/books/${bookSlug}`}
        className="p-1.5 rounded-lg transition-colors shrink-0"
        style={{ color: "var(--text-secondary)" }}
        title="Kitap sayfasına dön"
      >
        <ArrowLeft size={18} />
      </Link>

      {/* Başlık */}
      <span
        className="flex-1 text-xs font-medium truncate"
        style={{ color: "var(--text-secondary)" }}
      >
        {bookTitle}
      </span>

      {/* Tema seçici */}
      <div
        className="flex items-center rounded-lg p-0.5 gap-0.5"
        style={{ background: "var(--bg-surface)" }}
      >
        {THEMES.map(({ value, icon, label }) => (
          <button
            key={value}
            onClick={() => onThemeChange(value)}
            title={label}
            className="p-1.5 rounded-md transition-colors"
            style={{
              background: theme === value ? "var(--bg-card)" : "transparent",
              color:
                theme === value ? "var(--accent)" : "var(--text-secondary)",
              boxShadow:
                theme === value ? "var(--shadow)" : "none",
            }}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Font boyutu */}
      <div
        className="flex items-center gap-1 rounded-lg px-1 py-0.5"
        style={{ background: "var(--bg-surface)" }}
      >
        <button
          onClick={() => onFontSizeChange(fontSize - 1)}
          disabled={fontSize <= 14}
          className="p-1.5 rounded-md transition-colors disabled:opacity-40"
          style={{ color: "var(--text-secondary)" }}
          title="Yazı küçült"
        >
          <Minus size={14} />
        </button>
        <span
          className="text-xs w-6 text-center tabular-nums"
          style={{ color: "var(--text-secondary)" }}
        >
          {fontSize}
        </span>
        <button
          onClick={() => onFontSizeChange(fontSize + 1)}
          disabled={fontSize >= 28}
          className="p-1.5 rounded-md transition-colors disabled:opacity-40"
          style={{ color: "var(--text-secondary)" }}
          title="Yazı büyüt"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Font ailesi */}
      <button
        onClick={() => onFontFamilyChange(fontFamily === "serif" ? "sans" : "serif")}
        title={fontFamily === "serif" ? "Sans-Serif'e geç" : "Serif'e geç"}
        className="p-1.5 rounded-lg text-xs font-bold transition-colors"
        style={{
          color: "var(--text-secondary)",
          fontFamily: fontFamily === "serif" ? "Georgia,serif" : "system-ui,sans-serif",
          background: "var(--bg-surface)",
          minWidth: "28px",
          textAlign: "center",
        }}
      >
        Aa
      </button>

      {/* İçindekiler */}
      {hasToc && (
        <button
          onClick={onTocClick}
          title="İçindekiler"
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <List size={16} />
        </button>
      )}

      {/* Notlar */}
      <button
        onClick={onNotesClick}
        title="Notlar & İşaretliler"
        className="relative p-1.5 rounded-lg transition-colors"
        style={{ color: "var(--text-secondary)" }}
      >
        <BookMarked size={16} />
        {notesCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[8px] flex items-center justify-center font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {notesCount > 9 ? "9+" : notesCount}
          </span>
        )}
      </button>
    </header>
  );
}
