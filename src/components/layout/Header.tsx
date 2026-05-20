"use client";

import Link from "next/link";
import { Sun, Moon, BookOpen, Sunset } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type { ReaderTheme } from "@/types/reader";

const THEME_CYCLE: ReaderTheme[] = ["light", "dark", "sepia"];

const ThemeIcon = ({ theme }: { theme: ReaderTheme }) => {
  if (theme === "dark") return <Moon size={18} />;
  if (theme === "sepia") return <Sunset size={18} />;
  return <Sun size={18} />;
};

export function Header() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const idx = THEME_CYCLE.indexOf(theme);
    setTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-sm"
      style={{
        background: "color-mix(in srgb, var(--bg-primary) 90%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-sm tracking-wide"
          style={{ color: "var(--text-primary)" }}
        >
          <BookOpen size={20} style={{ color: "var(--accent)" }} />
          {/* TODO: Site adını güncelle */}
          <span>KİTAPLAR</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/iletisim"
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            İletişim
          </Link>

          <button
            onClick={cycleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            title={`Tema: ${theme}`}
            aria-label="Tema değiştir"
          >
            <ThemeIcon theme={theme} />
          </button>
        </div>
      </div>
    </header>
  );
}
