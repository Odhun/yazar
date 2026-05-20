import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalContent } from "@/components/LegalContent";
import { AUTHOR } from "@/lib/books";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
};

export default function KvkkPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <LegalContent
          title="KVKK Aydınlatma Metni"
          sections={[
            {
              heading: "1. Veri Sorumlusu",
              body: `Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla ${AUTHOR.name} tarafından hazırlanmıştır.`,
            },
            {
              heading: "2. Kişisel Veri Toplanmıyor",
              body: "Bu web sitesi, sunucu tarafında herhangi bir kişisel veri toplamamaktadır. Kayıt, üyelik veya oturum açma sistemi bulunmamaktadır. Kullanıcı bilgileri üçüncü taraflarla paylaşılmamaktadır.",
            },
            {
              heading: "3. Tarayıcı Yerel Depolama (localStorage)",
              body: "Okuma ilerlemesi, vurgular ve tema tercihi gibi veriler yalnızca kullanıcının kendi cihazında tarayıcı yerel depolama alanına (localStorage) kaydedilmektedir. Bu veriler hiçbir sunucuya aktarılmamakta; yalnızca kullanıcının kendi tarayıcısında erişilebilir durumdadır. Kullanıcı bu verileri istediği zaman tarayıcı ayarlarından silebilir.",
            },
            {
              heading: "4. Üçüncü Taraf Hizmetler",
              body: "Site, Vercel üzerinden barındırılmaktadır. Vercel'in kendi gizlilik politikası geçerlidir. Site içinde analitik veya reklam amaçlı hiçbir üçüncü taraf kodu kullanılmamaktadır.",
            },
            {
              heading: "5. Haklar",
              body: `KVKK kapsamındaki haklarınız için ${AUTHOR.email ? AUTHOR.email + " adresinden" : "iletişim sayfasından"} tarafımıza ulaşabilirsiniz.`,
            },
            {
              heading: "6. Güncelleme",
              body: "Bu metin ihtiyaç duyulduğunda güncellenebilir. Önemli değişikliklerde sitenin ana sayfasında duyuru yapılacaktır.",
            },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
