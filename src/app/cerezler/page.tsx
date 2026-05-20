import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalContent } from "@/components/LegalContent";

export const metadata: Metadata = {
  title: "Çerez Politikası",
};

export default function CerezlerPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <LegalContent
          title="Çerez Politikası"
          sections={[
            {
              heading: "Çerez Kullanılmıyor",
              body: "Bu web sitesi, çerez (cookie) kullanmamaktadır. Oturumunuzu takip eden, reklam gösteren veya analitik amaçlı hiçbir çerez tarayıcınıza yerleştirilmemektedir.",
            },
            {
              heading: "Tarayıcı Yerel Depolama",
              body: "Okuma ilerlemesi, vurgular ve tema gibi tercihleriniz çerez değil, tarayıcı localStorage teknolojisi ile saklanmaktadır. Bu veriler yalnızca kendi cihazınızda kalır, sunucuya gönderilmez.",
            },
            {
              heading: "Depolanan Veriler",
              body: "• Tema tercihi (açık / koyu / sepya)\n• Yazı boyutu ve yazı tipi tercihi\n• Okuma ilerlemesi (CFI konumu ve yüzdesi)\n• Vurgular ve notlar",
            },
            {
              heading: "Verileri Silme",
              body: "Tarayıcınızın ayarlar menüsünden bu siteye ait site verilerini temizleyerek tüm kayıtlı bilgileri silebilirsiniz. Bu işlem okuma ilerlemenizi ve vurgularınızı kalıcı olarak siler.",
            },
            {
              heading: "Üçüncü Taraf Çerezler",
              body: "Site içinde Google Analytics, Facebook Pixel veya benzeri hiçbir üçüncü taraf izleme kodu bulunmamaktadır.",
            },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
