"use client";

import { useState, useEffect } from "react";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Zaten yüklüyse gösterme
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Bu oturumda kapatıldıysa gösterme
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ios) {
      setIsIOS(true);
      // iOS'ta Safari kontrolü — Chrome/Firefox'ta Safari paylaş menüsü yok
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (isSafari) setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("pwa-banner-dismissed", "1");
    setShow(false);
  };

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setPrompt(null);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 rounded-xl p-4 shadow-xl border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "var(--accent-light)" }}
        >
          {isIOS
            ? <Share size={18} style={{ color: "var(--accent)" }} />
            : <Download size={18} style={{ color: "var(--accent)" }} />
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Uygulamayı Yükle
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {isIOS
              ? 'Paylaş → "Ana Ekrana Ekle" — çevrimdışı çalışır'
              : "Cihazına ekle, internet olmadan da oku"
            }
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isIOS && (
            <button
              onClick={install}
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Yükle
            </button>
          )}
          <button
            onClick={dismiss}
            className="p-1 rounded-lg"
            style={{ color: "var(--text-muted)" }}
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
