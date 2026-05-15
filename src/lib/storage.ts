export const STORAGE_KEYS = {
  readerSettings: "ebook_reader_settings",
  siteTheme: "ebook_site_theme",
  progress: (slug: string) => `ebook_progress_${slug}`,
  highlights: (slug: string) => `ebook_highlights_${slug}`,
  comments: (slug: string) => `ebook_comments_${slug}`,
} as const;
