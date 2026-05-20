import type { Book } from "@/types/book";

// TODO: Kendi bilgilerinle güncelle
export const AUTHOR = {
  name: "Yazar Adı",
  bio: "Burada kısa biyografinizi yazabilirsiniz. Eserleriniz, yolculuğunuz ve okuyucularınıza iletmek istediğiniz mesaj.",
  photo: "/author.png",
  // İletişim — boş bırakılırsa o bölüm gizlenir
  email: "", // örn: "ornek@email.com"
  whatsapp: "", // ülke kodu dahil, örn: "905001234567"
  instagram: "", // örn: "kullanici_adi"
};

export const books: Book[] = [
  {
    slug: "kuran-yolu-meali",
    title: "Kur'an Yolu Meali",
    author: AUTHOR.name,
    coverImage: "/books/kuran-yolu-meali/cover.png",
    epubPath: "/books/kuran-yolu-meali/kur'an_yolu_meali.epub",
    // TODO: Gerçek özeti gir
    summary:
      "Kur'an-ı Kerim'in Türkçe meali. Bu eser, Kur'an metnini sade ve anlaşılır bir Türkçeyle aktararak okuyucuya İslam'ın temel kaynağına kolayca ulaşma imkânı sunmaktadır.",
    genre: "Din & Kültür",
    publishedYear: 2024,
    language: "tr",
  },
];

export function getBook(slug: string): Book | undefined {
  return books.find((b) => b.slug === slug);
}

export function getAllSlugs(): string[] {
  return books.map((b) => b.slug);
}
