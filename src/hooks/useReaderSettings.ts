"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage";
import type { ReaderSettings, ReaderTheme, FontFamily } from "@/types/reader";

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: "light",
  fontSize: 18,
  fontFamily: "serif",
};

export function useReaderSettings() {
  const [settings, setSettings, loaded] = useLocalStorage<ReaderSettings>(
    STORAGE_KEYS.readerSettings,
    DEFAULT_SETTINGS
  );

  const setTheme = useCallback(
    (theme: ReaderTheme) => setSettings((s) => ({ ...s, theme })),
    [setSettings]
  );

  const setFontSize = useCallback(
    (size: number) =>
      setSettings((s) => ({
        ...s,
        fontSize: Math.min(28, Math.max(14, size)),
      })),
    [setSettings]
  );

  const setFontFamily = useCallback(
    (fontFamily: FontFamily) => setSettings((s) => ({ ...s, fontFamily })),
    [setSettings]
  );

  return { settings, setTheme, setFontSize, setFontFamily, loaded };
}
