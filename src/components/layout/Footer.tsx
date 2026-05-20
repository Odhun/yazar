import Link from "next/link";
import { AUTHOR } from "@/lib/books";

export function Footer() {
  return (
    <footer
      className="border-t mt-auto py-6 text-center text-sm"
      style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-3">
        <Link href="/" className="hover:underline" style={{ color: "var(--text-muted)" }}>
          Kitaplar
        </Link>
        <span aria-hidden>·</span>
        <Link href="/iletisim" className="hover:underline" style={{ color: "var(--text-muted)" }}>
          İletişim
        </Link>
        <span aria-hidden>·</span>
        <Link href="/kvkk" className="hover:underline" style={{ color: "var(--text-muted)" }}>
          KVKK
        </Link>
        <span aria-hidden>·</span>
        <Link href="/cerezler" className="hover:underline" style={{ color: "var(--text-muted)" }}>
          Çerez Politikası
        </Link>
      </div>

      <p className="mb-1">© {new Date().getFullYear()} {AUTHOR.name}. Tüm hakları saklıdır.</p>

      <p className="text-xs" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
        Tasarım ve Geliştirme{" "}
        <a
          href="https://www.odhun.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: "var(--text-muted)" }}
        >
          OdhunSoft
        </a>
      </p>
    </footer>
  );
}
