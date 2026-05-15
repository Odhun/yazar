"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { ReaderTheme } from "@/types/reader";

interface SelectionPayload {
  cfiRange: string;
  text: string;
  x: number;
  y: number;
}

interface Props {
  epubUrl: string;
  initialCfi?: string;
  theme: ReaderTheme;
  fontSize: number;
  onProgress: (cfi: string, percent: number) => void;
  onSelection: (payload: SelectionPayload) => void;
  onClearSelection: () => void;
}

const EPUB_THEMES: Record<ReaderTheme, Record<string, Record<string, string>>> =
  {
    light: {
      body: {
        background: "#faf9f7 !important",
        color: "#1c1917 !important",
        "font-family": "Georgia, 'Times New Roman', serif",
        "line-height": "1.9",
        padding: "0 1rem",
      },
      p: { "margin-bottom": "1em" },
      a: { color: "#7c3aed !important" },
    },
    dark: {
      body: {
        background: "#1c1917 !important",
        color: "#fafaf9 !important",
        "font-family": "Georgia, 'Times New Roman', serif",
        "line-height": "1.9",
        padding: "0 1rem",
      },
      p: { "margin-bottom": "1em" },
      a: { color: "#a78bfa !important" },
    },
    sepia: {
      body: {
        background: "#f5f0e8 !important",
        color: "#3c2415 !important",
        "font-family": "Georgia, 'Times New Roman', serif",
        "line-height": "1.9",
        padding: "0 1rem",
      },
      p: { "margin-bottom": "1em" },
      a: { color: "#8b5e3c !important" },
    },
  };

export function EpubReader({
  epubUrl,
  initialCfi,
  theme,
  fontSize,
  onProgress,
  onSelection,
  onClearSelection,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renditionRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // İlklendirme
  useEffect(() => {
    if (!containerRef.current) return;
    let mounted = true;

    const init = async () => {
      try {
        const ePub = (await import("epubjs")).default;

        if (!mounted) return;

        const book = ePub(epubUrl);
        bookRef.current = book;

        const rendition = book.renderTo(containerRef.current!, {
          width: "100%",
          height: "100%",
          spread: "none",
        });
        renditionRef.current = rendition;

        // Temaları kaydet
        (Object.keys(EPUB_THEMES) as ReaderTheme[]).forEach((t) => {
          rendition.themes.register(t, EPUB_THEMES[t]);
        });
        rendition.themes.select(theme);
        rendition.themes.fontSize(`${fontSize}px`);

        // Görüntüle
        await rendition.display(initialCfi ?? undefined);

        // Konum takibi
        await book.locations.generate(1024);

        if (!mounted) return;
        setLoading(false);

        rendition.on("relocated", (loc: { start: { cfi: string }; atStart: boolean; atEnd: boolean }) => {
          if (!mounted) return;
          const cfi = loc.start.cfi;
          const pct = Math.round(
            book.locations.percentageFromCfi(cfi) * 100
          );
          onProgress(cfi, Math.max(0, Math.min(100, pct)));
          setAtStart(loc.atStart);
          setAtEnd(loc.atEnd);
        });

        // Metin seçimi
        rendition.on("selected", (cfiRange: string, contents: { window: Window; document: Document }) => {
          if (!mounted) return;
          const sel = contents.window.getSelection();
          if (!sel || sel.rangeCount === 0) return;
          const text = sel.toString().trim();
          if (!text) return;

          const iframe = (
            contents.document.defaultView as (Window & typeof globalThis) | null
          )?.frameElement as HTMLIFrameElement | null;
          if (!iframe) return;

          const iRect = iframe.getBoundingClientRect();
          const range = sel.getRangeAt(0);
          const rRect = range.getBoundingClientRect();

          onSelection({
            cfiRange,
            text,
            x: iRect.left + rRect.left + rRect.width / 2,
            y: iRect.top + rRect.top,
          });
        });

        // Boş alana tıklayınca seçimi temizle
        rendition.on("click", () => {
          if (mounted) onClearSelection();
        });
      } catch (err) {
        console.error("epubjs error:", err);
        if (mounted) setError("E-kitap yüklenemedi. Dosya yolunu kontrol edin.");
      }
    };

    init();

    return () => {
      mounted = false;
      bookRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epubUrl, initialCfi]);

  // Tema değişimi (re-init olmadan)
  useEffect(() => {
    renditionRef.current?.themes.select(theme);
  }, [theme]);

  // Font boyutu değişimi
  useEffect(() => {
    renditionRef.current?.themes.fontSize(`${fontSize}px`);
  }, [fontSize]);

  const nextPage = useCallback(
    () => renditionRef.current?.next(),
    []
  );
  const prevPage = useCallback(
    () => renditionRef.current?.prev(),
    []
  );

  // Klavye gezinme
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [nextPage, prevPage]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-4xl mb-4">📚</p>
          <p
            className="font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {error}
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Dosyanın{" "}
            <code className="text-xs px-1 rounded" style={{ background: "var(--bg-surface)" }}>
              public/books/kuran-yolu-meali/
            </code>{" "}
            klasöründe olduğundan emin olun.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex relative overflow-hidden">
      {/* Yükleniyor */}
      {loading && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ background: "var(--bg-primary)" }}
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: "var(--accent)" }}
            />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Kitap yükleniyor…
            </p>
          </div>
        </div>
      )}

      {/* Önceki sayfa butonu */}
      <button
        onClick={prevPage}
        disabled={atStart}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full transition-all disabled:opacity-0"
        style={{
          background: "color-mix(in srgb, var(--bg-card) 85%, transparent)",
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
        }}
        aria-label="Önceki sayfa"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Epub container */}
      <div
        ref={containerRef}
        className="flex-1 reader-container"
        style={{ background: "var(--bg-primary)" }}
      />

      {/* Sonraki sayfa butonu */}
      <button
        onClick={nextPage}
        disabled={atEnd}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full transition-all disabled:opacity-0"
        style={{
          background: "color-mix(in srgb, var(--bg-card) 85%, transparent)",
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
        }}
        aria-label="Sonraki sayfa"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
