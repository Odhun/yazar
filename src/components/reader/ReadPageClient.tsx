"use client";

import { useState, useRef } from "react";
import { ReaderToolbar } from "./ReaderToolbar";
import { ProgressBar } from "./ProgressBar";
import { EpubReader } from "./EpubReader";
import { SelectionMenu } from "./SelectionMenu";
import { HighlightsPanel } from "./HighlightsPanel";
import { useReaderSettings } from "@/hooks/useReaderSettings";
import { useBookProgress } from "@/hooks/useBookProgress";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { assetUrl } from "@/lib/asset";
import { STORAGE_KEYS } from "@/lib/storage";
import type { Book } from "@/types/book";
import type { Highlight } from "@/types/reader";

interface SelectionState {
  visible: boolean;
  cfiRange: string;
  text: string;
  x: number;
  y: number;
}

const EMPTY_SELECTION: SelectionState = {
  visible: false,
  cfiRange: "",
  text: "",
  x: 0,
  y: 0,
};

interface Props {
  book: Book;
}

export function ReadPageClient({ book }: Props) {
  const { settings, setTheme, setFontSize, loaded } = useReaderSettings();
  const { progress, saveProgress } = useBookProgress(book.slug);
  const [percent, setPercent] = useState(0);
  const [selection, setSelection] = useState<SelectionState>(EMPTY_SELECTION);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const addHighlightRef = useRef<((cfi: string, color: string) => void) | null>(null);
  const goToPageRef = useRef<((page: number) => void) | null>(null);
  const goToCfiRef = useRef<((cfi: string) => void) | null>(null);

  const [highlights, setHighlights] = useLocalStorage<Highlight[]>(
    STORAGE_KEYS.highlights(book.slug),
    []
  );
  const addHighlight = (h: Highlight) =>
    setHighlights((prev) => [...prev, h]);
  const deleteHighlight = (id: string) =>
    setHighlights((prev) => prev.filter((item) => item.id !== id));

  if (!loaded) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      />
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh", background: "var(--bg-primary)" }}
    >
      <ReaderToolbar
        theme={settings.theme}
        fontSize={settings.fontSize}
        bookTitle={book.title}
        bookSlug={book.slug}
        notesCount={highlights.length}
        onThemeChange={setTheme}
        onFontSizeChange={setFontSize}
        onNotesClick={() => setShowNotes((v) => !v)}
      />

      <ProgressBar
        percent={percent}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageJump={(page) => goToPageRef.current?.(page)}
      />

      <div className="flex-1 relative flex flex-col overflow-hidden">
        <EpubReader
          epubUrl={assetUrl(book.epubPath)}
          initialCfi={progress?.cfi}
          theme={settings.theme}
          fontSize={settings.fontSize}
          onProgress={(cfi, pct) => {
            saveProgress(cfi, pct);
            setPercent(pct);
          }}
          onPageChange={(current, total) => {
            setCurrentPage(current);
            setTotalPages(total);
          }}
          onSelection={({ cfiRange, text, x, y }) =>
            setSelection({ visible: true, cfiRange, text, x, y })
          }
          onClearSelection={() => setSelection(EMPTY_SELECTION)}
          addHighlightRef={addHighlightRef}
          goToPageRef={goToPageRef}
          goToCfiRef={goToCfiRef}
        />

        {selection.visible && (
          <SelectionMenu
            position={{ x: selection.x, y: selection.y }}
            cfiRange={selection.cfiRange}
            text={selection.text}
            onClose={() => setSelection(EMPTY_SELECTION)}
            onSave={addHighlight}
            onHighlightAdd={(cfi, color) => addHighlightRef.current?.(cfi, color)}
          />
        )}

        {showNotes && (
          <HighlightsPanel
            highlights={highlights}
            onClose={() => setShowNotes(false)}
            onGoTo={(cfi) => goToCfiRef.current?.(cfi)}
            onDelete={deleteHighlight}
          />
        )}
      </div>
    </div>
  );
}
