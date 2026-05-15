export type ReaderTheme = "light" | "dark" | "sepia";

export interface ReaderSettings {
  theme: ReaderTheme;
  fontSize: number;
}

export interface BookProgress {
  cfi: string;
  percent: number;
  updatedAt: string;
}

export type HighlightColor = "yellow" | "green" | "blue" | "pink";

export interface Highlight {
  id: string;
  cfi: string;
  text: string;
  note: string;
  color: HighlightColor;
  createdAt: string;
}
