"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage";
import type { BookProgress } from "@/types/reader";

export function useBookProgress(slug: string) {
  const [progress, setProgress, loaded] = useLocalStorage<BookProgress | null>(
    STORAGE_KEYS.progress(slug),
    null
  );

  const saveProgress = useCallback(
    (cfi: string, percent: number) => {
      setProgress({ cfi, percent, updatedAt: new Date().toISOString() });
    },
    [setProgress]
  );

  return { progress, saveProgress, loaded };
}
