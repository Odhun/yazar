"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  addHighlightRef?: React.MutableRefObject<((cfi: string, color: string) => void) | null>;
}

const EPUB_THEMES: Record<ReaderTheme, Record<string, Record<string, string>>> =
  {
    light: {
      body: {
        background: "#faf9f7 !important",
        color: "#1c1917 !important",
        "font-family": "Georgia, 'Times New Roman', serif",
        "line-height": "1.9",
        padding: "0 2rem",
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
        padding: "0 2rem",
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
        padding: "0 2rem",
      },
      p: { "margin-bottom": "1em" },
      a: { color: "#8b5e3c !important" },
    },
  };

const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: "#fde047",
  green: "#86efac",
  blue: "#93c5fd",
  pink: "#f9a8d4",
};

export function EpubReader({
  epubUrl,
  initialCfi,
  theme,
  fontSize,
  onProgress,
  onSelection,
  onClearSelection,
  addHighlightRef,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renditionRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Konteyner boyutunu al — mobil dahil güvenilir
  const getDimensions = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return { w: window.innerWidth, h: window.innerHeight - 56 };
    const rect = el.getBoundingClientRect();
    return {
      w: Math.floor(rect.width) || window.innerWidth,
      h: Math.floor(rect.height) || window.innerHeight - 56,
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return;
    let mounted = true;

    const init = async () => {
      try {
        const ePub = (await import("epubjs")).default;
        if (!mounted) return;

        // Boyutları net al — string '100%' yerine sayı geç
        const { w, h } = getDimensions();

        const book = ePub(epubUrl);
        bookRef.current = book;

        const rendition = book.renderTo(containerRef.current!, {
          width: w,
          height: h,
          spread: "none",
        });
        renditionRef.current = rendition;

        // addHighlight fonksiyonunu dışarıya aç
        if (addHighlightRef) {
          addHighlightRef.current = (cfi: string, color: string) => {
            renditionRef.current?.annotations.highlight(
              cfi,
              {},
              undefined,
              "hl",
              { fill: HIGHLIGHT_COLORS[color] ?? "#fde047", "fill-opacity": "0.35" }
            );
          };
        }

        // Swipe (mobil sayfa geçişi) — iframe içine listener ekle
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rendition.hooks.content.register((contents: any) => {
          if (!contents?.document) return;
          let startX = 0;
          let startY = 0;
          contents.document.addEventListener(
            "touchstart",
            (e: TouchEvent) => {
              startX = e.touches[0].clientX;
              startY = e.touches[0].clientY;
            },
            { passive: true }
          );
          contents.document.addEventListener(
            "touchend",
            (e: TouchEvent) => {
              const dx = e.changedTouches[0].clientX - startX;
              const dy = e.changedTouches[0].clientY - startY;
              const sel = (contents.window as Window)?.getSelection?.();
              const hasSelection = sel && sel.toString().trim().length > 0;
              if (
                !hasSelection &&
                Math.abs(dx) > 50 &&
                Math.abs(dx) > Math.abs(dy)
              ) {
                if (dx > 0) renditionRef.current?.prev();
                else renditionRef.current?.next();
              }
            },
            { passive: true }
          );
        });

        // Temaları kaydet
        (Object.keys(EPUB_THEMES) as ReaderTheme[]).forEach((t) => {
          rendition.themes.register(t, EPUB_THEMES[t]);
        });
        rendition.themes.select(theme);
        rendition.themes.fontSize(`${fontSize}px`);

        await rendition.display(initialCfi ?? undefined);
        await book.locations.generate(1024);

        if (!mounted) return;
        setLoading(false);

        // Konum takibi
        rendition.on(
          "relocated",
          (loc: {
            start: { cfi: string };
            atStart: boolean;
            atEnd: boolean;
          }) => {
            if (!mounted) return;
            const cfi = loc.start.cfi;
            const pct = Math.round(
              book.locations.percentageFromCfi(cfi) * 100
            );
            onProgress(cfi, Math.max(0, Math.min(100, pct)));
            setAtStart(loc.atStart);
            setAtEnd(loc.atEnd);
          }
        );

        // Metin seçimi
        rendition.on(
          "selected",
          (
            cfiRange: string,
            contents: { window: Window; document: Document }
          ) => {
            if (!mounted) return;
            const sel = contents.window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const text = sel.toString().trim();
            if (!text) return;

            const iframe = (
              contents.document.defaultView as Window | null
            )?.frameElement as HTMLIFrameElement | null;

            // iframe bulunamazsa containerRef ile fallback
            const iRect =
              iframe?.getBoundingClientRect() ??
              containerRef.current?.getBoundingClientRect() ??
              { left: 0, top: 0 };

            const range = sel.getRangeAt(0);
            const rRect = range.getBoundingClientRect();

            onSelection({
              cfiRange,
              text,
              x: iRect.left + rRect.left + rRect.width / 2,
              y: iRect.top + rRect.top,
            });
          }
        );

        // Boş alana tıklanınca seçim temizle —
        // ama seçim varsa menüyü kapatma (race condition fix)
        rendition.on(
          "click",
          (...args: unknown[]) => {
            if (!mounted) return;
            const contents = args[1] as { window: Window } | undefined;
            const sel = contents?.window?.getSelection();
            if (!sel || !sel.toString().trim()) {
              onClearSelection();
            }
          }
        );

        // Pencere/konteyner boyutu değişince rendition'ı yeniden boyutlandır
        const resizeObserver = new ResizeObserver(() => {
          if (!mounted) return;
          const { w: nw, h: nh } = getDimensions();
          if (nw > 0 && nh > 0) {
            renditionRef.current?.resize(nw, nh);
          }
        });
        resizeObserver.observe(wrapperRef.current!);

        return () => resizeObserver.disconnect();
      } catch (err) {
        console.error("epubjs error:", err);
        if (mounted)
          setError("E-kitap yüklenemedi. Dosya yolunu kontrol edin.");
      }
    };

    init();

    return () => {
      mounted = false;
      bookRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epubUrl, initialCfi]);

  // Tema değişimi (yeniden init olmadan)
  useEffect(() => {
    renditionRef.current?.themes.select(theme);
  }, [theme]);

  // Font boyutu değişimi
  useEffect(() => {
    renditionRef.current?.themes.fontSize(`${fontSize}px`);
  }, [fontSize]);

  const nextPage = useCallback(() => renditionRef.current?.next(), []);
  const prevPage = useCallback(() => renditionRef.current?.prev(), []);

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
          <p className="font-medium mb-2" style={{ color: "var(--text-primary)" }}>
            {error}
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Dosyanın{" "}
            <code
              className="text-xs px-1 rounded"
              style={{ background: "var(--bg-surface)" }}
            >
              public/books/kuran-yolu-meali/
            </code>{" "}
            klasöründe olduğundan emin olun.
          </p>
        </div>
      </div>
    );
  }

  return (
    // wrapperRef — boyut ölçümü için
    <div ref={wrapperRef} className="flex-1 relative flex flex-col min-h-0">
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

      {/* Önceki sayfa */}
      <button
        onClick={prevPage}
        disabled={atStart}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full transition-all disabled:opacity-0"
        style={{
          background:
            "color-mix(in srgb, var(--bg-card) 85%, transparent)",
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
        }}
        aria-label="Önceki sayfa"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Epub içeriği — containerRef */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 reader-container"
        style={{ background: "var(--bg-primary)" }}
      />

      {/* Sonraki sayfa */}
      <button
        onClick={nextPage}
        disabled={atEnd}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full transition-all disabled:opacity-0"
        style={{
          background:
            "color-mix(in srgb, var(--bg-card) 85%, transparent)",
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
