# project_plan.md — Yazar E-Kitap Sitesi

## 1. Teknoloji Kararları

| Karar | Seçim | Neden |
|---|---|---|
| Framework | Next.js 14 App Router, `output: 'export'` | GitHub Pages static hosting |
| Stil | Tailwind CSS + CSS variables | Tema sistemi (dark/light/sepia) için |
| İkonlar | Lucide React | Tree-shakable, zero-dep |
| EPUB render | `epubjs` (v0.3.x) | En olgun tarayıcı EPUB kütüphanesi |
| State | React Context + localStorage | Backend yok, hydration-safe |
| Tip güvenliği | TypeScript strict | |

**Static Export Kısıtı:** `next/image` → `<img>` ile sarılacak (`unoptimized`). Dynamic route'lar `generateStaticParams` ile pre-render edilecek.

---

## 2. Klasör Yapısı

```
yazarcom/
├── public/
│   ├── books/
│   │   ├── kitap-1/
│   │   │   ├── cover.jpg
│   │   │   └── book.epub
│   │   └── kitap-2/
│   │       ├── cover.jpg
│   │       └── book.epub
│   └── author.jpg
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, ThemeProvider wrap
│   │   ├── page.tsx                # Ana Sayfa (Vitrin)
│   │   ├── globals.css             # Tailwind + CSS tema değişkenleri
│   │   ├── books/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx        # Kitap Detay Sayfası
│   │   │       └── read/
│   │   │           └── page.tsx    # Okuyucu Modu
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── home/
│   │   │   ├── AuthorBio.tsx
│   │   │   └── BookGrid.tsx
│   │   ├── book/
│   │   │   ├── BookCard.tsx        # Grid'deki kart
│   │   │   ├── BookDetail.tsx      # Detay sayfası içeriği
│   │   │   └── CommentSection.tsx  # LocalStorage yorumlar
│   │   └── reader/
│   │       ├── EpubReader.tsx      # epubjs wrapper (use client)
│   │       ├── ReaderToolbar.tsx   # Tema/font kontrolleri
│   │       ├── ProgressBar.tsx
│   │       └── SelectionMenu.tsx   # Not al / Highlight menüsü
│   │
│   ├── context/
│   │   ├── ThemeContext.tsx        # dark | light | sepia
│   │   └── ReaderContext.tsx       # fontSize, currentCfi, highlights
│   │
│   ├── hooks/
│   │   ├── useLocalStorage.ts      # Hydration-safe generic hook
│   │   ├── useReaderSettings.ts    # fontSize + tema persist
│   │   └── useBookProgress.ts      # CFI + son konum
│   │
│   ├── lib/
│   │   ├── books.ts                # Kitap veri kaynağı (static JSON)
│   │   └── storage.ts              # localStorage key sabitleri + helpers
│   │
│   └── types/
│       ├── book.ts
│       ├── reader.ts
│       └── storage.ts
│
├── books-data.ts                   # (src/lib/books.ts'e taşınır) Kitap listesi
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 3. Bileşen Hiyerarşisi

```
RootLayout (ThemeProvider)
│
├── / (Ana Sayfa)
│   ├── Header
│   ├── AuthorBio
│   ├── BookGrid
│   │   └── BookCard × N
│   └── Footer
│
├── /books/[slug] (Detay)
│   ├── Header
│   ├── BookDetail
│   │   ├── kapak img
│   │   ├── meta bilgiler
│   │   ├── özet
│   │   └── "Okumaya Başla" → /books/[slug]/read
│   ├── CommentSection (localStorage)
│   └── Footer
│
└── /books/[slug]/read (Okuyucu)
    ├── ReaderToolbar
    │   ├── tema toggle (dark/light/sepia)
    │   ├── font +/- butonları
    │   └── geri dön butonu
    ├── ProgressBar
    ├── EpubReader          ← "use client", epubjs burada mount
    │   └── SelectionMenu   ← text-selection üzerinde floating
    └── (Footer yok — tam ekran okuma)
```

---

## 4. Veri Kaynağı — `src/lib/books.ts`

Kitap verileri hardcode array. Yeni kitap eklemek = diziye bir nesne eklemek.

```typescript
// src/types/book.ts
export interface Book {
  slug: string;          // URL slug, public/books/{slug}/ klasörüyle eşleşir
  title: string;
  author: string;        // Site tek yazar ama generic bırakıyoruz
  coverImage: string;    // /books/{slug}/cover.jpg
  epubPath: string;      // /books/{slug}/book.epub
  summary: string;
  genre: string;
  publishedYear: number;
  pageCount: number;
  language: 'tr' | 'en';
}
```

---

## 5. LocalStorage Veri Şeması

Tüm key'ler `src/lib/storage.ts` sabitlerinden alınır. Prefix: `ebook_`.

### 5.1 Okuyucu Ayarları (global)
```
KEY: "ebook_reader_settings"
TYPE: ReaderSettings
{
  theme: "light" | "dark" | "sepia",   // default: "light"
  fontSize: number                      // 14–28, default: 18
}
```

### 5.2 Kitap İlerlemesi (kitap başına)
```
KEY: "ebook_progress_{slug}"
TYPE: BookProgress
{
  cfi: string,          // epubjs CFI konumu (son konum)
  percent: number,      // 0–100
  updatedAt: string     // ISO date
}
```

### 5.3 Highlight'lar (kitap başına)
```
KEY: "ebook_highlights_{slug}"
TYPE: Highlight[]
[
  {
    id: string,          // crypto.randomUUID()
    cfi: string,         // seçili alanın CFI range'i
    text: string,        // seçilen ham metin
    note: string,        // kullanıcı notu (boş olabilir)
    color: "yellow" | "green" | "blue" | "pink",
    createdAt: string    // ISO date
  }
]
```

### 5.4 Yorumlar (kitap başına)
```
KEY: "ebook_comments_{slug}"
TYPE: Comment[]
[
  {
    id: string,
    authorName: string,  // kullanıcının girdiği takma ad
    text: string,
    rating: 1 | 2 | 3 | 4 | 5,
    createdAt: string
  }
]
```

---

## 6. Hydration Güvenliği

`epubjs` ve `localStorage` sadece browser'da çalışır. Strateji:

1. **`useLocalStorage` hook** — ilk render'da `undefined` döner, `useEffect` sonrası gerçek değer yüklenir.
2. **`EpubReader`** — `dynamic(() => import(...), { ssr: false })` ile import edilir.
3. **`SelectionMenu`** — `typeof window !== 'undefined'` guard ile `document.addEventListener`.
4. Server-side `generateStaticParams` — tüm slug'ları `books.ts`'den okuyarak üretir.

---

## 7. Tema Sistemi

`globals.css`'de CSS variables:

```css
[data-theme="light"]  { --bg: #ffffff; --text: #1a1a1a; --surface: #f5f5f5; }
[data-theme="dark"]   { --bg: #1a1a1a; --text: #e8e8e8; --surface: #2a2a2a; }
[data-theme="sepia"]  { --bg: #f4ecd8; --text: #3d2b1f; --surface: #ede0c4; }
```

`ThemeContext` → `document.documentElement.dataset.theme` set eder + localStorage'a yazar.
epubjs iframe içine da aynı CSS inject edilir (`rendition.themes.register`).

---

## 8. Route Yapısı (Static Export)

| URL | Dosya | `generateStaticParams` |
|---|---|---|
| `/` | `app/page.tsx` | — |
| `/books/[slug]` | `app/books/[slug]/page.tsx` | `books.ts`'den slug listesi |
| `/books/[slug]/read` | `app/books/[slug]/read/page.tsx` | `books.ts`'den slug listesi |

`next.config.ts`:
```typescript
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '',          // GitHub Pages custom domain varsa boş kalır
  trailingSlash: true,   // GitHub Pages için gerekli
};
```

---

## 9. Geliştirme Sırası (Uygulama Adımları)

Onay sonrası bu sırayla ilerleyeceğiz, her adımda tam dosyalar:

1. **Proje iskeleti** — `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `globals.css`
2. **Tipler ve veri** — `src/types/*`, `src/lib/books.ts`, `src/lib/storage.ts`
3. **Hook'lar** — `useLocalStorage`, `useReaderSettings`, `useBookProgress`
4. **Context'ler** — `ThemeContext`, `ReaderContext`
5. **Layout + Header/Footer**
6. **Ana Sayfa** — `AuthorBio` + `BookGrid` + `BookCard`
7. **Kitap Detay Sayfası** — `BookDetail` + `CommentSection`
8. **Okuyucu Modu** — `EpubReader` + `ReaderToolbar` + `ProgressBar` + `SelectionMenu`

---

## 10. Önemli Notlar

- EPUB dosyaları `public/books/{slug}/book.epub` altında. Boyutlara göre GitHub'un 100MB dosya limiti gözetilmeli.
- GitHub Pages custom domain varsa `next.config.ts`'deki `basePath` boş kalır; subdirectory deploy (`/repo-adi/`) gerekirse `basePath: '/repo-adi'` eklenir.
- `CommentSection` gerçek bir yorum sistemi değil — sadece LocalStorage simülasyonu. İnternette başka kullanıcılar göremez.
