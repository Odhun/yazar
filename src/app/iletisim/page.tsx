import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactContent } from "@/components/ContactContent";

export const metadata: Metadata = {
  title: "İletişim",
};

export default function IletisimPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ContactContent />
      </main>
      <Footer />
    </>
  );
}
