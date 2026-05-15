export function Footer() {
  return (
    <footer
      className="border-t mt-auto py-8 text-center text-sm"
      style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
    >
      {/* TODO: Kendi adın */}
      <p>© {new Date().getFullYear()} Yazar Adı. Tüm hakları saklıdır.</p>
    </footer>
  );
}
