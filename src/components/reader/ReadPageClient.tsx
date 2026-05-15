"use client";

import { useState } from "react";
import { ReaderToolbar } from "./ReaderToolbar";
import { ProgressBar } from "./ProgressBar";
import { EpubReader } from "./EpubReader";
import { SelectionMenu } from "./SelectionMenu";
import { useReaderSettings } from "@/hooks/useReaderSettings";
import { useBookProgress } from "@/hooks/useBookProgress";
import { assetUrl } from "@/lib/asset";
import type { Book } from "@/types/book";

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
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <ReaderToolbar
        theme={settings.theme}
        fontSize={settings.fontSize}
        bookTitle={book.title}
        bookSlug={book.slug}
        onThemeChange={setTheme}
        onFontSizeChange={setFontSize}
      />

      <ProgressBar percent={percent} />

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
          onSelection={({ cfiRange, text, x, y }) =>
            setSelection({ visible: true, cfiRange, text, x, y })
          }
          onClearSelection={() => setSelection(EMPTY_SELECTION)}
        />

        {selection.visible && (
          <SelectionMenu
            position={{ x: selection.x, y: selection.y }}
            cfiRange={selection.cfiRange}
            text={selection.text}
            slug={book.slug}
            onClose={() => setSelection(EMPTY_SELECTION)}
          />
        )}
      </div>
    </div>
  );
}
