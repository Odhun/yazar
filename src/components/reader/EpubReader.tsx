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
  goToPageRef?: React.MutableRefObject<((page: number) => void) | null>;
  goToCfiRef?: React.MutableRefObject<((cfi: string) => void) | null>;
  onPageChange?: (current: number, total: number) => void;
  highlightsRef?: React.MutableRefObject<Array<{ cfi: string; color: string }>>;
}

const THEME_CSS: Record<ReaderTheme, string> = {
  light: `
    html,body{background:#faf9f7!important;color:#1c1917!important}
    body{font-family:Georgia,'Times New Roman',serif!important;line-height:1.9!important;padding:0 2rem!important;margin:0!important}
    p{margin-bottom:1em} a{color:#7c3aed!important}
  `,
  dark: `
    html,body{background:#1c1917!important;color:#fafaf9!important}
    body{font-family:Georgia,'Times New Roman',serif!important;line-height:1.9!important;padding:0 2rem!important;margin:0!important}
    p{margin-bottom:1em} a{color:#a78bfa!important}
  `,
  sepia: `
    html,body{background:#f5f0e8!important;color:#3c2415!important}
    body{font-family:Georgia,'Times New Roman',serif!important;line-height:1.9!important;padding:0 2rem!important;margin:0!important}
    p{margin-bottom:1em} a{color:#8b5e3c!important}
  `,
};

const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: "#fde047",
  green: "#86efac",
  blue: "#93c5fd",
  pink: "#f9a8d4",
};

function buildCSS(theme: ReaderTheme, fontSize: number): string {
  return [
    THEME_CSS[theme],
    `body{font-size:${fontSize}px!important}`,
    `*{-webkit-user-select:text!important;user-select:text!important}`,
    `img,video,svg{max-width:100%!important;height:auto!important}`,
  ].join("\n");
}

function injectStyle(doc: Document, id: string, css: string) {
  let el = doc.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = doc.createElement("style");
    el.id = id;
    (doc.head ?? doc.documentElement).appendChild(el);
  }
  el.textContent = css;
}

// ── IndexedDB epub cache ──────────────────────────────────────────────────────
const DB_NAME = "__epub_cache__";
const STORE = "books";

function openDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCached(key: string): Promise<any | null> {
  try {
    const db = await openDB();
    return await new Promise((res) => {
      const req = db.transaction(STORE).objectStore(STORE).get(key);
      req.onsuccess = () => res(req.result ?? null);
      req.onerror = () => res(null);
    });
  } catch { return null; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function putCached(key: string, value: any): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((res) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    });
  } catch { /* fail silently */ }
}
// ─────────────────────────────────────────────────────────────────────────────

export function EpubReader({
  epubUrl,
  initialCfi,
  theme,
  fontSize,
  onProgress,
  onSelection,
  onClearSelection,
  addHighlightRef,
  goToPageRef,
  goToCfiRef,
  onPageChange,
  highlightsRef,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renditionRef = useRef<any>(null);

  // Refs — closure'lar her zaman güncel değeri okur
  const themeRef = useRef<ReaderTheme>(theme);
  const fontSizeRef = useRef<number>(fontSize);
  const onPageChangeRef = useRef(onPageChange);
  // Optimistic page update için
  const currentPageRef = useRef(1);
  const totalPagesRef = useRef(0);
  themeRef.current = theme;
  fontSizeRef.current = fontSize;
  onPageChangeRef.current = onPageChange;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

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

        // Cache-first epub yükleme
        let epubSource: string | ArrayBuffer = epubUrl;
        const cached = await getCached(epubUrl);
        if (cached) {
          epubSource = cached;
        } else {
          try {
            const resp = await fetch(epubUrl);
            if (resp.ok) {
              const buf = await resp.arrayBuffer();
              putCached(epubUrl, buf); // fire-and-forget
              epubSource = buf;
            }
          } catch { /* URL fallback */ }
        }
        if (!mounted) return;

        const { w, h } = getDimensions();
        const book = ePub(epubSource);
        bookRef.current = book;

        const rendition = book.renderTo(containerRef.current!, {
          width: w,
          height: h,
          spread: "none",
        });
        renditionRef.current = rendition;

        if (addHighlightRef) {
          addHighlightRef.current = (cfi: string, color: string) => {
            renditionRef.current?.annotations.highlight(
              cfi, {}, undefined, "hl",
              { fill: HIGHLIGHT_COLORS[color] ?? "#fde047", "fill-opacity": "0.35" }
            );
          };
        }

        // Her sayfa yüklendiğinde: stil + swipe
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rendition.hooks.content.register((contents: any) => {
          if (!contents?.document) return;
          const doc: Document = contents.document;
          const win: Window = contents.window;

          injectStyle(doc, "__ereader__", buildCSS(themeRef.current, fontSizeRef.current));

          let startX = 0;
          let startY = 0;
          doc.addEventListener("touchstart", (e: TouchEvent) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
          }, { passive: true });
          doc.addEventListener("touchend", (e: TouchEvent) => {
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            const hasSel = win?.getSelection?.()?.toString().trim();
            if (!hasSel && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
              // Optimistic update
              if (totalPagesRef.current > 0) {
                if (dx > 0) {
                  onPageChangeRef.current?.(
                    Math.max(currentPageRef.current - 1, 1), totalPagesRef.current
                  );
                  renditionRef.current?.prev();
                } else {
                  onPageChangeRef.current?.(
                    Math.min(currentPageRef.current + 1, totalPagesRef.current), totalPagesRef.current
                  );
                  renditionRef.current?.next();
                }
              } else {
                if (dx > 0) renditionRef.current?.prev();
                else renditionRef.current?.next();
              }
            }
          }, { passive: true });
        });

        await rendition.display(initialCfi ?? undefined);

        // Locations cache: generate bir kere yap, sonrasında yükle
        const locsKey = epubUrl + "|locs";
        const cachedLocs = await getCached(locsKey);
        if (cachedLocs && Array.isArray(cachedLocs) && cachedLocs.length > 0) {
          book.locations.load(cachedLocs);
        } else {
          const locs = await book.locations.generate(1024);
          if (Array.isArray(locs) && locs.length > 0) {
            putCached(locsKey, locs); // fire-and-forget
          }
        }

        if (!mounted) return;
        setLoading(false);

        // Kaydedilmiş highlight'ları yeni rendition'a uygula
        highlightsRef?.current?.forEach(({ cfi, color }) => {
          try {
            rendition.annotations.highlight(
              cfi, {}, undefined, "hl",
              { fill: HIGHLIGHT_COLORS[color] ?? "#fde047", "fill-opacity": "0.35" }
            );
          } catch { /* geçersiz CFI — atla */ }
        });

        const total = book.locations.length();
        totalPagesRef.current = total;

        if (goToPageRef) {
          goToPageRef.current = (page: number) => {
            const idx = Math.max(0, Math.min(page - 1, total - 1));
            const cfi = bookRef.current?.locations.cfiFromLocation(idx);
            if (cfi) renditionRef.current?.display(cfi);
          };
        }
        if (goToCfiRef) {
          goToCfiRef.current = (cfi: string) => {
            renditionRef.current?.display(cfi);
          };
        }

        rendition.on(
          "relocated",
          (loc: { start: { cfi: string }; atStart: boolean; atEnd: boolean }) => {
            if (!mounted) return;
            const cfi = loc.start.cfi;
            const pctRaw = book.locations.percentageFromCfi(cfi);
            const pct = Math.round(pctRaw * 100);
            onProgress(cfi, Math.max(0, Math.min(100, pct)));
            setAtStart(loc.atStart);
            setAtEnd(loc.atEnd);
            const t = book.locations.length();
            // Kesin sayfa — optimistic'i düzelt
            const pg = t > 0 ? Math.max(1, Math.min(t, Math.ceil(pctRaw * t) || 1)) : 1;
            currentPageRef.current = pg;
            totalPagesRef.current = t;
            onPageChange?.(pg, t);
          }
        );

        onPageChange?.(1, total);

        rendition.on(
          "selected",
          (cfiRange: string, contents: { window: Window; document: Document }) => {
            if (!mounted) return;
            const sel = contents.window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const text = sel.toString().trim();
            if (!text) return;

            const iframe = contents.document.defaultView
              ?.frameElement as HTMLIFrameElement | null;
            const iRect = iframe?.getBoundingClientRect()
              ?? containerRef.current?.getBoundingClientRect()
              ?? { left: 0, top: 0 };

            const range = sel.getRangeAt(0);
            const rRect = range.getBoundingClientRect();

            const x = rRect.width > 0
              ? (iRect.left ?? 0) + rRect.left + rRect.width / 2
              : window.innerWidth / 2;
            const y = rRect.height > 0
              ? (iRect.top ?? 0) + rRect.top
              : (iRect.top ?? 0) + 80;

            onSelection({ cfiRange, text, x, y });
          }
        );

        rendition.on("click", (...args: unknown[]) => {
          if (!mounted) return;
          const contents = args[1] as { window: Window } | undefined;
          const sel = contents?.window?.getSelection();
          if (!sel || !sel.toString().trim()) onClearSelection();
        });

        const ro = new ResizeObserver(() => {
          if (!mounted) return;
          const { w: nw, h: nh } = getDimensions();
          if (nw > 0 && nh > 0) renditionRef.current?.resize(nw, nh);
        });
        ro.observe(wrapperRef.current!);
        return () => ro.disconnect();
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

  // Tema: açık view'larda stil elementini doğrudan güncelle
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renditionRef.current?.getContents()?.forEach((c: any) => {
      if (c?.document) injectStyle(c.document, "__ereader__", buildCSS(theme, fontSizeRef.current));
    });
  }, [theme]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renditionRef.current?.getContents()?.forEach((c: any) => {
      if (c?.document) injectStyle(c.document, "__ereader__", buildCSS(themeRef.current, fontSize));
    });
  }, [fontSize]);

  // Optimistic + gerçek navigasyon
  const nextPage = useCallback(() => {
    if (totalPagesRef.current > 0) {
      onPageChangeRef.current?.(
        Math.min(currentPageRef.current + 1, totalPagesRef.current),
        totalPagesRef.current
      );
    }
    renditionRef.current?.next();
  }, []);

  const prevPage = useCallback(() => {
    if (totalPagesRef.current > 0) {
      onPageChangeRef.current?.(
        Math.max(currentPageRef.current - 1, 1),
        totalPagesRef.current
      );
    }
    renditionRef.current?.prev();
  }, []);

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
          <p className="font-medium mb-2" style={{ color: "var(--text-primary)" }}>{error}</p>
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
    <div ref={wrapperRef} className="flex-1 relative flex flex-col min-h-0">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10"
          style={{ background: "var(--bg-primary)" }}>
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Kitap yükleniyor…</p>
          </div>
        </div>
      )}

      <button onClick={prevPage} disabled={atStart}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full transition-all disabled:opacity-0"
        style={{ background: "color-mix(in srgb, var(--bg-card) 85%, transparent)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        aria-label="Önceki sayfa">
        <ChevronLeft size={20} />
      </button>

      <div ref={containerRef} className="flex-1 min-h-0 reader-container"
        style={{ background: "var(--bg-primary)" }} />

      <button onClick={nextPage} disabled={atEnd}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full transition-all disabled:opacity-0"
        style={{ background: "color-mix(in srgb, var(--bg-card) 85%, transparent)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        aria-label="Sonraki sayfa">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
